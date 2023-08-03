import asyncHandler from "express-async-handler";

import { prisma } from "../config/prismaConfig.js";

export const createUser = asyncHandler(async (req, res) => {
  console.log("Criando um usuário");

  let { email } = req.body;
  const userExists = await prisma.user.findUnique({ where: { email: email } });
  if (!userExists) {
    const user = await prisma.user.create({ data: req.body });
    res.send({
      message: "Usuário cadastrado com sucesso!",
      user: user,
    });
  } else res.status(201).send({ message: "Usuario ja existe no banco de dados" });
});

//função para visita em residencia

export const bookVisit = asyncHandler(async (req, res) => {
  const { email, date } = req.body;
  const { id } = req.params;

  try {

    const alreadyBooked = await prisma.user.findUnique({
      where: { email },
      select: { bookedVisits: true }
    });

    if (alreadyBooked.bookedVisits.some((visit) => visit.id === id)) {
      res.status(400).json({ message: "Esta residência já foi reservada por você" })
    } else {
      await prisma.user.update({
        where: { email: email },
        data: {
          bookedVisits: { push: { id, date } }
        }
      });
      res.send("A sua visita foi marcada com sucesso")
    }
  } catch (err) {
    throw new Error(err.message);
  }
});

// function to get all bookinks of a user
export const getAllBookings = asyncHandler(async (req, res) => {
  const { email } = req.body;
  try {
    const bookings = await prisma.user.findUnique({
      where: { email },
      select: { bookedVisits: true }
    });
    res.status(200).send(bookings);
  } catch (err) {
    throw new Error(err.message);
  }
});


// function to cancel the resevar.
export const cancelBooking = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const { id } = req.params
  try {

    const user = await prisma.user.findUnique({
      where: { email: email }, //mesmo nome, não repete pra não da pau.
      select: { bookedVisits: true }
    })
    console.log(user);


    const index = user.bookedVisits.findIndex((visit) => visit.id === id)
    debugger;
    if (index === -1) {
      res.status(404).json({ message: "Reseva não encontrada" })
    } else {
      user.bookedVisits.splice(index, 1)
      await prisma.user.update({
        where: { email },
        data: {
          bookedVisits: user.bookedVisits
        }
      })

      res.send("Resevar cancelada com sucesso!")

    }

  } catch (err) {
    throw new Error(err.message);
  }
});


// Function to add a resd in favourite list of a user

export const toFav = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const { rid } = req.params;

  try {

    const user = await prisma.user.findUnique({
      where: { email }
    })
    if (user.favResidenciesID.includes(rid)) {
      const updateUser = await prisma.user.update({
        where: { email },
        data: {
          favResidenciesID: {
            set: user.favResidenciesID.filter((id) => id !== rid)
          }
        }
      });
      res.send({ message: "Removido com sucesso!", user: updateUser })
    } else {
      const updateUser = await prisma.user.update({

        where: { email },
        data: {
          favResidenciesID: {
            push: rid
          }
        }
      })

      res.send({ message: "Favoritos atualizados", user: updateUser })

    }
  } catch (err) {
    throw new Error(err.message);
  }

})

// function to get all favorites

export const getAllFavorites = asyncHandler(async (req, res) => {
  const { email } = req.body;
  try {
    const favResd = await prisma.user.findUnique({
      where: { email },
      select: { favResidenciesID: true }
    })
    res.status(200).send(favResd)
  } catch (err) {
    throw new Error(err.message);
  }

})