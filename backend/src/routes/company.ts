import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { requireCompany } from "../middlewares/companyScope";
import { authorize } from "../middlewares/authorize";
import prisma from "../prismaClient";
import { v4 as uuidv4 } from "uuid";

const router = Router();

router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const { name, logoUrl } = req.body;
    const userId = req.user!.id;
    const company = await prisma.company.create({ data: { name, logoUrl } });
    await prisma.membership.create({ data: { userId, companyId: company.id, role: "OWNER" } });
    await prisma.user.update({ where: { id: userId }, data: { activeCompanyId: company.id } });
    res.json(company);
  } catch (err) { next(err); }
});

router.get("/companies", authMiddleware, async (req, res, next) => {
  try {
    const page = Number(req.query.page ?? 1);
    const perPage = Math.min(Number(req.query.perPage ?? 10), 50);
    const skip = (page - 1) * perPage;
    const userId = req.user!.id;
    const [items, total] = await Promise.all([
      prisma.company.findMany({
        where: { members: { some: { userId } } },
        skip, take: perPage, orderBy: { createdAt: "desc" }
      }),
      prisma.company.count({ where: { members: { some: { userId } } } })
    ]);
    res.json({ items, total, page, perPage });
  } catch (err) { next(err); }
});

router.post("/:id/invite", authMiddleware, requireCompany(true), authorize(["OWNER", "ADMIN"]), async (req, res, next) => {
  try {
    const companyId = req.params.id;
    const { email, role } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const existingMembership = await prisma.membership.findUnique({
      where: { userId_companyId: { userId: req.user!.id, companyId } }
    });

    const existingInvite = await prisma.invite.findFirst({
      where: { email, companyId, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });
    if (existingInvite) return res.json({ invite: existingInvite });

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const invite = await prisma.invite.create({
      data: { email, companyId, token, role: role ?? "MEMBER", expiresAt }
    });

    res.json({ invite });
  } catch (err) { next(err); }
});

router.post("/:id/select", authMiddleware, requireCompany(true), async (req, res, next) => {
  try {
    const companyId = req.params.id;
    await prisma.user.update({ where: { id: req.user!.id }, data: { activeCompanyId: companyId } });
    const { signSession } = require("../utils/jwt");
    const token = signSession({ userId: req.user!.id, activeCompanyId: companyId });
    res.cookie("session", token, { httpOnly: true, sameSite: "lax" });
    res.json({ message: "Company selected", companyId });
  } catch (err) { next(err); }
});

router.get("/:id", authMiddleware, requireCompany(true), authorize(["OWNER", "ADMIN", "MEMBER"]), async (req, res, next) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.params.id },
      include: { members: { include: { user: true } } }
    });
    res.json(company);
  } catch (err) { next(err); }
});

router.post("/:id/remove-member", authMiddleware, requireCompany(true), authorize(["OWNER", "ADMIN"]), async (req, res, next) => {
  try {
    const { memberId } = req.body;
    const companyId = req.params.id;

    const targetMembership = await prisma.membership.findUnique({ where: { id: memberId } });
    if (!targetMembership) return res.status(404).json({ message: "Membership not found" });

    if (targetMembership.role === "OWNER") {
      const owners = await prisma.membership.count({ where: { companyId, role: "OWNER" } });
      if (owners <= 1) return res.status(400).json({ message: "Company must have at least one OWNER" });
      if (req.user!.role === "ADMIN") return res.status(403).json({ message: "ADMIN cannot remove OWNER" });
    }

    await prisma.membership.delete({ where: { id: memberId } });

    await prisma.user.updateMany({ where: { id: targetMembership.userId, activeCompanyId: companyId }, data: { activeCompanyId: null } });

    res.json({ message: "Member removed" });
  } catch (err) { next(err); }
});

export default router;
