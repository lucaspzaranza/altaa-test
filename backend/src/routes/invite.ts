import { Router } from "express";
import prisma from "../prismaClient"; // ajuste caminho se necessário
import { authMiddleware } from "../middlewares/auth";
import { v4 as uuidv4 } from "uuid";

const router = Router();

router.get("/my", authMiddleware, async (req, res, next) => {
  try {
    const userEmail = req.user!.email;
    const now = new Date();

    const invites = await prisma.invite.findMany({
      where: {
        email: userEmail,
        used: false,
        expiresAt: { gt: now },
      },
      include: {
        company: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ invites });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/accept", authMiddleware, async (req, res, next) => {
  try {
    const inviteId = req.params.id;
    const userId = req.user!.id;
    const userEmail = req.user!.email;

    const invite = await prisma.invite.findUnique({
      where: { id: inviteId },
    });

    if (!invite) return res.status(404).json({ message: "Invite not found" });

    if (invite.email !== userEmail) {
      return res.status(403).json({ message: "Forbidden: not the invite recipient" });
    }

    if (invite.used) {
      return res.status(400).json({ message: "Invite already used" });
    }

    if (invite.expiresAt <= new Date()) {
      return res.status(400).json({ message: "Invite expired" });
    }

    const existingMembership = await prisma.membership.findUnique({
      where: { userId_companyId: { userId, companyId: invite.companyId } },
    });

    if (existingMembership) {
      await prisma.invite.update({
        where: { id: inviteId },
        data: { used: true, userId },
      });

      return res.json({ message: "Already a member (invite marked as used)" });
    }

    const membership = await prisma.membership.create({
      data: {
        userId,
        companyId: invite.companyId,
        role: invite.role,
      },
    });

    await prisma.invite.update({
      where: { id: inviteId },
      data: {
        used: true,
        userId,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { activeCompanyId: invite.companyId },
    });

    const company = await prisma.company.findUnique({ where: { id: invite.companyId } });

    return res.json({ message: "Invite accepted", membership, company });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    const inviteId = req.params.id;
    const userEmail = req.user!.email;

    const invite = await prisma.invite.findUnique({
      where: { id: inviteId },
    });

    if (!invite) return res.status(404).json({ message: "Invite not found" });

    if (invite.email !== userEmail) {
      return res.status(403).json({ message: "Forbidden: not the invite recipient" });
    }

    await prisma.invite.delete({
      where: { id: inviteId },
    });

    return res.json({ message: "Invite removed" });
  } catch (err) {
    next(err);
  }
});

export default router;
