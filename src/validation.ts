import { date, number, object, string } from 'yup';



let updateUserSchema = object({
  email: string().required().trim(),
  password: string().required().trim(),
  role: string().required().trim()
});

let createUserSchema = object({
  email: string().required().trim(),
  password: string().required().trim(),
  role: string().required().trim()
});

let createCourseSchema = object({
  title: string().required().trim(),
  date: date().required()
});

let updateCourseSchema = object({
  title: string().required().trim(),
  date: date().required()
})

let createStudentCourseSchema = object({
  student_id: number().required(),
  course_id: number().required()
});

export { createUserSchema, updateUserSchema, createCourseSchema, updateCourseSchema, createStudentCourseSchema};