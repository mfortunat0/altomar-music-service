import { Response, Router } from "express";
import { hash, compare } from "bcrypt";
import { PrismaClient } from "@prisma/client";

const userRouter = Router();
const prisma = new PrismaClient();

const createNewUser = async ({
  name,
  email,
  birthDay,
  password,
  response,
}: {
  name: string;
  email: string;
  birthDay: string;
  password: string;
  response: Response;
}) => {
  try {
    await prisma.user.create({
      data: {
        name,
        email,
        birthDay,
        password,
      },
    });
  } catch (error) {
    console.log(error);
    response.status(400).json({ error });
  } finally {
    await prisma.$disconnect();
  }
};

userRouter.post("/", async (req, res) => {
  const { name, email, birthDay, password } = req.body;
  const SALT = Number(process.env.SALT) || 8;
  const SALT_TEXT = process.env.SALT_TEXT || "exampleText";

  if (!name || !email || !birthDay || !password) {
    res.status(400).send();
    return;
  }

  const userExists = await verifyUserExists({ email });

  if (userExists) {
    res.status(400).send();
    return;
  }

  const passwordHash = await hash(password + SALT_TEXT, SALT);

  await createNewUser({
    name,
    email,
    birthDay,
    password: passwordHash,
    response: res,
  });

  res.status(201).send();
});

const verifyUserExists = async ({ email }: { email: string }) => {
  try {
    return await prisma.user.findFirst({
      where: {
        email,
      },
    });
  } catch (error) {
    console.log(error);
  } finally {
    await prisma.$disconnect();
  }
};

userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const SALT_TEXT = process.env.SALT_TEXT || "exampleText";

  if (!email || !password) {
    res.status(400).send();
    return;
  }

  const userExists = await verifyUserExists({ email });

  if (!userExists) {
    res.status(400).send({
      error: "Email not registred",
    });
    return;
  }

  const validate = await compare(password + SALT_TEXT, userExists.password);

  if (!validate) {
    res.status(401).send({
      error: "Invalid credentials",
    });
    return;
  }

  res.status(201).send();
});

export { userRouter };
