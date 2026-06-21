import { apiResponse } from "@/lib/apiResponse";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { checkAuth } from "@/middlewares/auth/checkAuth";
import { prisma } from "@/services/prisma";
import { NextRequest } from "next/server";
import { buildUserName, trimOptionalString } from "@/lib/user";
import {
  changePasswordValidator,
  profileUpdateValidator,
} from "@/validators/api/auth/profile";
import { validateRequest } from "@/lib/validator";
import { Prisma } from "@/generated/prisma/client";

export const getProfile = async (req: NextRequest) => {
  const user = await checkAuth(req);

  if (user) {
    const foundUser = await prisma.user.findFirst({
      where: { id: user.id, isDeleted: false },
      select: {
        id: true,
        name: true,
        firstName: true,
        middleName: true,
        lastName: true,
        preferredName: true,
        gender: true,
        dob: true,
        maritalStatus: true,
        location: true,
        contactNumber: true,
        email: true,
        identityType: true,
        identityNumber: true,
        qualifications: true,
        department: true,
        title: true,
        loginId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        permissions: {
          select: {
            permission: {
              select: {
                action: { select: { id: true, name: true } },
                module: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });

    if (!foundUser) {
      return apiResponse({
        status: RESPONSE_STATUS.UNAUTHORIZED,
        message: "Unauthorized",
      });
    }

    const moduleMap = new Map<
      number,
      {
        module: {
          name: string;
          id: number;
        };
        actions: { id: number; name: string }[];
      }
    >();

    foundUser.permissions.forEach((up) => {
      if (up.permission) {
        const { module, action } = up.permission;

        if (!moduleMap.has(module.id)) {
          moduleMap.set(module.id, {
            module,
            actions: [],
          });
        }

        moduleMap.get(module.id)?.actions.push(action);
      }
    });

    return apiResponse({
      status: RESPONSE_STATUS.SUCCESS,
      data: { ...foundUser, permissions: Array.from(moduleMap.values()) },
      message: "New Token Assigned Successfully",
    });
  }

  return apiResponse({
    status: RESPONSE_STATUS.UNAUTHORIZED,
    message: "Unauthorized",
  });
};

export const updateProfile = async (req: NextRequest) => {
  const user = await checkAuth(req);

  if (!user) {
    return apiResponse({
      status: RESPONSE_STATUS.UNAUTHORIZED,
      message: "Unauthorized",
    });
  }

  return validateRequest({
    bodySchema: profileUpdateValidator,
    req,
    onSuccess: async ({ body }) => {
      const contactNumber = body.contactNumber.trim();

      if (contactNumber !== user.contactNumber) {
        const duplicateUser = await prisma.user.findFirst({
          where: {
            contactNumber,
            id: { not: user.id },
          },
        });

        if (duplicateUser) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "User access code already exists for this phone number",
          });
        }
      }

      const foundUser = await prisma.user.findFirst({
        where: { id: user.id, isDeleted: false },
        include: { doctor: true },
      });

      if (!foundUser) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "User not found",
        });
      }

      const nextEmail = body.email?.trim();
      const doctorDuplicateChecks: Prisma.DoctorWhereInput[] = [];

      if (
        foundUser.doctor &&
        contactNumber !== foundUser.doctor.phoneNumber
      ) {
        doctorDuplicateChecks.push({
          phoneNumber: contactNumber,
          userId: { not: user.id },
        });
      }

      if (foundUser.doctor && nextEmail && nextEmail !== foundUser.doctor.email) {
        doctorDuplicateChecks.push({
          email: nextEmail,
          userId: { not: user.id },
        });
      }

      if (doctorDuplicateChecks.length) {
        const duplicateDoctor = await prisma.doctor.findFirst({
          where: { OR: doctorDuplicateChecks },
        });

        if (duplicateDoctor) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Doctor phone number or email already exists",
          });
        }
      }

      const { location, ...profileData } = body;

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          ...profileData,
          middleName: trimOptionalString(profileData.middleName),
          locationId: location?.id ?? null,
          email: trimOptionalString(profileData.email),
          identityNumber: trimOptionalString(profileData.identityNumber),
          qualifications: trimOptionalString(profileData.qualifications),
          department: trimOptionalString(profileData.department),
          contactNumber,
          loginId: contactNumber,
          username: contactNumber,
          name: buildUserName(profileData),
        },
      });

      if (foundUser.doctor) {
        await prisma.doctor.update({
          where: { userId: user.id },
          data: {
            phoneNumber: contactNumber,
            email: trimOptionalString(profileData.email),
            qualifications: trimOptionalString(profileData.qualifications),
            department: trimOptionalString(profileData.department),
          },
        });
      }

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Profile updated successfully",
        data: updatedUser,
      });
    },
  });
};

export const changePassword = async (req: NextRequest) => {
  const user = await checkAuth(req);

  if (!user) {
    return apiResponse({
      status: RESPONSE_STATUS.UNAUTHORIZED,
      message: "Unauthorized",
    });
  }

  return validateRequest({
    bodySchema: changePasswordValidator,
    req,
    onSuccess: async ({ body }) => {
      const foundUser = await prisma.user.findFirst({
        where: { id: user.id, isDeleted: false },
      });

      if (!foundUser) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "User not found",
        });
      }

      if (foundUser.password !== body.currentPassword) {
        return apiResponse({
          status: RESPONSE_STATUS.BAD_REQUEST,
          message: "Current password is incorrect",
        });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { password: body.newPassword },
      });

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Password changed successfully",
        data: null,
      });
    },
  });
};
