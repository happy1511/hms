import { prisma } from "@/services/prisma";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { apiResponse } from "@/lib/apiResponse";
import { Prisma, User } from "@/generated/prisma/client";
import {
  locationQueryValidator,
  locationValidator,
  partialLocationValidator,
} from "@/validators/api/masters/location";

export const getAPI = async (req: Request) => {
  return validateRequest({
    querySchema: locationQueryValidator,
    req,
    onSuccess: async ({ query }) => {
      const page = Number(query.page ?? 1);
      const limit = Number(query.limit ?? 10);
      const search = query.search ?? "";
      const field = query.field;
      const country = query.country?.trim();
      const state = query.state?.trim();
      const city = query.city?.trim();
      const postcode = query.postcode?.trim();
      const postName = query.postName?.trim();

      const skip = (page - 1) * limit;
      const and: Prisma.LocationWhereInput[] = [];

      if (search) {
        and.push({
          OR: [
            {
              city: { contains: search },
            },
            {
              state: { contains: search },
            },
            {
              country: { contains: search },
            },
            {
              postcode: { contains: search },
            },
            {
              postName: { contains: search },
            },
          ],
        });
      }

      if (country) {
        and.push({ country: { equals: country } });
      }
      if (state) {
        and.push({ state: { equals: state } });
      }
      if (city) {
        and.push({ city: { equals: city } });
      }
      if (postcode) {
        and.push({ postcode: { equals: postcode } });
      }
      if (postName) {
        and.push({ postName: { equals: postName } });
      }
      and.push({ isDeleted: false });

      const where: Prisma.LocationWhereInput = and.length ? { AND: and } : {};

      if (field) {
        if (field === "postName") {
          const items = await prisma.location.findMany({
            skip,
            take: limit + 1,
            where,
            orderBy: { postName: "asc" },
            select: {
              id: true,
              city: true,
              state: true,
              postcode: true,
              country: true,
              postName: true,
            },
          });

          const hasMore = items.length > limit;
          const data = hasMore ? items.slice(0, limit) : items;

          return apiResponse({
            status: RESPONSE_STATUS.SUCCESS,
            message: "Location options fetched successfully",
            data,
            total: skip + data.length + (hasMore ? 1 : 0),
          });
        }

        const queryOptions = {
          skip,
          take: limit + 1,
          where,
        };

        if (field === "country") {
          const items = await prisma.location.findMany({
            ...queryOptions,
            distinct: ["country"],
            orderBy: { country: "asc" },
            select: { country: true },
          });
          const hasMore = items.length > limit;
          const data = hasMore ? items.slice(0, limit) : items;

          return apiResponse({
            status: RESPONSE_STATUS.SUCCESS,
            message: "Location options fetched successfully",
            data: data,
            total: skip + data.length + (hasMore ? 1 : 0),
          });
        }

        if (field === "state") {
          const items = await prisma.location.findMany({
            ...queryOptions,
            distinct: ["state"],
            orderBy: { state: "asc" },
            select: { state: true },
          });
          const hasMore = items.length > limit;
          const data = hasMore ? items.slice(0, limit) : items;

          return apiResponse({
            status: RESPONSE_STATUS.SUCCESS,
            message: "Location options fetched successfully",
            data: data,
            total: skip + data.length + (hasMore ? 1 : 0),
          });
        }

        if (field === "city") {
          const items = await prisma.location.findMany({
            ...queryOptions,
            distinct: ["city"],
            orderBy: { city: "asc" },
            select: { city: true },
          });
          const hasMore = items.length > limit;
          const data = hasMore ? items.slice(0, limit) : items;

          return apiResponse({
            status: RESPONSE_STATUS.SUCCESS,
            message: "Location options fetched successfully",
            data: data,
            total: skip + data.length + (hasMore ? 1 : 0),
          });
        }

        const items = await prisma.location.findMany({
          ...queryOptions,
          distinct: ["postcode"],
          orderBy: { postcode: "asc" },
          select: { postcode: true },
        });
        const hasMore = items.length > limit;
        const data = hasMore ? items.slice(0, limit) : items;

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Location options fetched successfully",
          data: data,
          total: skip + data.length + (hasMore ? 1 : 0),
        });
      }

      const [items, total] = await prisma.$transaction([
        prisma.location.findMany({
          skip,
          take: limit,
          where,
          select: {
            id: true,
            city: true,
            state: true,
            postcode: true,
            country: true,
            postName: true,
          },
        }),
        prisma.location.count({ where }),
      ]);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Locations Fetched Successfully",
        data: items,
        total,
      });
    },
  });
};

export const createAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: locationValidator,
    req,
    onSuccess: async ({ body }) => {
      return prisma.$transaction(async (tx) => {
        const locationData = {
          city: body.city.trim(),
          state: body.state.trim(),
          country: body.country.trim(),
          postcode: body.postcode.trim(),
          postName: body.postName.trim(),
        };
        const existingLocation = await tx.location.findFirst({
          where: {
            ...locationData,
            isDeleted: false,
          },
        });

        if (existingLocation) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Location with same details already exists",
          });
        }

        const location = await tx.location.create({
          data: {
            ...locationData,
            createdBy: user.id,
            updatedBy: user.id,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "Location Created Successfully",
          data: location,
        });
      });
    },
  });
};

export const updateAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: partialLocationValidator,
    req,
    onSuccess: async ({ body }) => {
      const data = body;

      return prisma.$transaction(async (tx) => {
        const existingLocation = await tx.location.findFirst({
          where: { id: data.id, isDeleted: false },
        });

        if (!existingLocation) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Bed not found",
          });
        }

        const locationData = {
          city: body.city?.trim() ?? existingLocation.city,
          state: body.state?.trim() ?? existingLocation.state,
          country: body.country?.trim() ?? existingLocation.country,
          postcode: body.postcode?.trim() ?? existingLocation.postcode,
          postName: body.postName?.trim() ?? existingLocation.postName,
        };
        const duplicateLocation = await tx.location.findFirst({
          where: {
            id: { not: data.id },
            ...locationData,
            isDeleted: false,
          },
        });

        if (duplicateLocation) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Location with same details already exists",
          });
        }

        const updatedLocation = await tx.location.update({
          where: { id: data.id },
          data: {
            ...body,
            ...locationData,
            updatedBy: user.id,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Location Updated Successfully",
          data: updatedLocation,
        });
      });
    },
  });
};

export const deleteAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: partialLocationValidator,
    req,
    onSuccess: async ({ body }) => {
      const data = body;
      return prisma.$transaction(async (tx) => {
        const existingLocation = await tx.location.findFirst({
          where: { id: data.id, isDeleted: false },
        });

        if (!existingLocation) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Location not found",
          });
        }

        await tx.location.update({
          where: { id: data.id },
          data: {
            isDeleted: true,
            deletedBy: user.id,
            updatedBy: user.id,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Location Deleted Successfully",
          data: null,
        });
      });
    },
  });
};
