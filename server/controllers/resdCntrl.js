import asyncHandler from "express-async-handler";

import { prisma } from "../config/prismaConfig.js";

export const createResidency = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    price,
    address,
    city,
    country,
    image,
    facilities,
    userEmail
  } = req.body.data;

  console.log(req.body.data);
  try {
    const residency = await prisma.residency.create({
      data: {
        title,
        description,
        price,
        address,
        city,
        country,
        image,
        facilities,
        owner: {connect: { email: userEmail}},
      },
    });

    res.send({message: "Residência adicionada com sucesso!", residency});
  } catch (err) {
    if (err.code === "P2002") {
      throw new Error("O endereço da residência, ja existe!");
    }
    throw new Error(err.message);
  }
});
// obtem todas as residencias no mongodb
export const getAllResidencies = asyncHandler(async(req, res) => {
    const residencies = await prisma.residency.findMany({
      orderBy: {
        createdAt: "desc"
      }
    });
    res.send(residencies);
});

// obtem uma especifica residencia no mongodb
export const getResidency = asyncHandler(async(req, res) => {
   const {id} = req.params;

  try {
    
    const residency = await prisma.residency.findUnique({
      where: {id}
    });

    res.send(residency);

  } catch (err) {
    throw new Error(err.message);
  }
});
