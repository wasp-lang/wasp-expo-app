import { HttpError } from "wasp/server";
import { GetTasksApi, GetUserApi } from "wasp/server/api";

export const getTasks: GetTasksApi = async (req, res, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const tasks = await context.entities.Task.findMany({
    where: { userId: context.user.id },
  });

  res.json(tasks);
};

export const getUser: GetUserApi = async (req, res, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  res.json(context.user);
};
