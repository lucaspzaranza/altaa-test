import { Router } from "express";
import bcrypt from "bcrypt";
import prisma from "../prismaClient";
import { signSession } from "../utils/jwt";

const router = Router();

router.post("/signup", async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Missing" });
    const existing = await prisma.user.findUnique({ where: { email }});
    if (existing) return res.status(409).json({ message: "User exists" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, passwordHash, name }});
    const token = signSession({ userId: user.id, activeCompanyId: user.activeCompanyId ?? null });
    res.cookie("session", token, { httpOnly: true, sameSite: "lax" });
    res.json({ user });
  } catch (err) { next(err); }
});

router.post("/accept-invite", async (req, res, next) => {
  try {
    const { token, name, password } = req.body;
    if (!token) return res.status(400).json({ message: "Token required" });
    const invite = await prisma.invite.findUnique({ where: { token }});
    if (!invite || invite.used || invite.expiresAt < new Date()) return res.status(400).json({ message: "Invalid or expired invite" });
    let user = await prisma.user.findUnique({ where: { email: invite.email }});
    if (!user) {
      if (!password) return res.status(400).json({ message: "Password required for new user" });
      const passwordHash = await bcrypt.hash(password, 10);
      user = await prisma.user.create({ data: { email: invite.email, name, passwordHash }});
    }
    await prisma.membership.upsert({
      where: { userId_companyId: { userId: user.id, companyId: invite.companyId } },
      update: { role: invite.role },
      create: { userId: user.id, companyId: invite.companyId, role: invite.role }
    });
    await prisma.invite.update({ where: { id: invite.id }, data: { used: true }});
    await prisma.user.update({ where: { id: user.id }, data: { activeCompanyId: invite.companyId }});
    const jwt = signSession({ userId: user.id, activeCompanyId: invite.companyId });
    res.cookie("session", jwt, { httpOnly: true, sameSite: "lax" });
    res.json({ message: "Invite accepted", userId: user.id });
  } catch (err) { next(err); }
});

export default router;
