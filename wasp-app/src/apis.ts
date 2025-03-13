import { HttpError } from "wasp/server";
import { GetTasksApi, GetUserApi, UpdateTaskAsDoneApi } from "wasp/server/api";

export const getTasks: GetTasksApi = async (req, res, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const tasks = await context.entities.Task.findMany({
    where: { userId: context.user.id },
    orderBy: { id: "asc" },
  });

  res.json(tasks);
};

export const updateTaskAsDone: UpdateTaskAsDoneApi = async (
  req,
  res,
  context
) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const taskId = parseInt(req.params.taskId);
  const task = await context.entities.Task.findUnique({
    where: { id: taskId },
  });

  if (!task || task.userId !== context.user.id) {
    throw new HttpError(404);
  }

  const isDone = req.body.isDone;
  await context.entities.Task.update({
    where: { id: taskId },
    data: { isDone },
  });

  res.json({ success: true });
};

export const getUser: GetUserApi = async (req, res, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  res.json(context.user);
};
