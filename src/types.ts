type User = {
  id: number,
  email: string,
  password: string,
  role: string
}

type Course = {
  id:number,
  title: string,
  date: Date
}

type Student_Course = {
  student_id: number,
  course_id: number,
  registeredAt: Date,
  signedAt: Date | null
}

type Data = {
  users: User[],
  courses: Course[]
  students_courses: Student_Course[]
}

export { User, Course, Student_Course, Data }