import Express, { NextFunction, Request, Response } from 'express'
import { ValidationError } from 'yup';

import { createCourseSchema, createUserSchema, createStudentCourseSchema} from './validation'
import db from './db'
import e from 'express';

const app = Express()

app.use(Express.json())

    // Get all users
  app.get('/users', async (req, res) => {
    // Load data from db.json into db.data
    await db.read()

    res.json(db.data.users)
  })

  // Get users by id
  app.get('/users/:id', async (req, res) => {
    const id = parseInt(req.params.id)

    await db.read()
    const user = db.data.users.find(user => user.id === id)

    if (!user) {
      res.sendStatus(404)
      return
    }

    res.json(user)
  })


  const validateSchema = (schema: any) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validate(req.body, {abortEarly: false});
      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        console.log(error.errors);
        res.status(400).json({message: error.errors})
      }
    }
  }

  // Fonction pour authentifier un utilisateur
  function auth(email: string, password: string): number {
    const lowerCaseEmail = email.toLowerCase(); 
    const user = db.data.users.find((u: { email: string, password: string, role: string }) => u.email.toLowerCase() === lowerCaseEmail && u.password === password);

    if (user) {
        if (user.role === 'admin') {
            return 2;
        } else if (user.role === 'student') {
            return 1;
        }
    }

    return 0;
  }


   // POST /users
    app.post('/users', validateSchema(createUserSchema), async (req, res) => {
      const person = req.body  
      
      await db.read()

      const creat_email = person.creator_email
      const creat_pass = person.creator_password

      if (auth(creat_email, creat_pass) !== 2) {
        return res.status(503).json({ error: 'Access Denied' });
      }
      
      if (person.role !== "admin" && person.role !== "student") {
        return res.status(404).json({error: 'Unvalid role for user'})
      }


      const lastCreatedPerson = db.data.users[db.data.users.length - 1]
      const id = lastCreatedPerson ? lastCreatedPerson.id + 1 : 1

      const email = person.email
      const password = person.password
      const role = person.role

      db.data.users.push({ id, email, password, role })

      await db.write()

      res.json({ id })
    })


    // POST /courses
    app.post('/courses', validateSchema(createCourseSchema), async (req, res) => {
      const { email, password } = req.body
      const course = req.body    
      
      await db.read()

      if (auth(email, password) !== 2) {
        return res.status(403).json({ error: 'Access Denied' });
      }

      const lastCreatedCourse= db.data.courses[db.data.courses.length - 1]
      const id = lastCreatedCourse ? lastCreatedCourse.id + 1 : 1

      const title = course.title
      const date = course.date

      db.data.courses.push({ id, title, date})

      await db.write()

      res.json({ id })
    })


    //POST /students-courses
      app.post('/students-courses', validateSchema(createStudentCourseSchema), async (req, res) => {
      const { email, password } = req.body;

      await db.read()
  
      if (auth(email, password) !== 2) {
        return res.status(503).json({ error: 'Access Denied' });
      }

      const { student_id, course_id } = req.body;
      const dateNow: Date = new Date();

      const newRecord = {
          student_id,
          course_id,
          registeredAt: dateNow,
          signedAt: null,
      };

      db.data.students_courses.push(newRecord);
      await db.write();

      res.json(newRecord);
  });
    
  // Sign a student to a course
  app.patch('/students-courses/:course_id', async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const course_id = parseInt(req.params.course_id);

    await db.read();
  
    if (auth(email, password) !== 1) {
      return res.status(403).json({ error: 'Access Denied' });
    }
  
    const lowerCaseEmail = email.toLowerCase();
    const user = db.data.users.find((u: { id: number, email: string, password: string }) => u.email.toLowerCase() === lowerCaseEmail && u.password === password);
  
    if (!user) {
      return res.status(503).json({ error: 'Access Denied' });
    }
  
    const studentCourse = db.data.students_courses.find((sc: { student_id: number, course_id: number, registeredAt: Date, signedAt: Date | null }) =>
      sc.student_id === user.id && sc.course_id === course_id && sc.signedAt === null
    );

  
    if (!studentCourse) {
      return res.status(404).json({ error: 'Cours signé introuvable, ou déjà signé' });
    }
  
    studentCourse.signedAt = new Date();

    await db.write();
  
    res.json(studentCourse);
  });
  




app.listen(3000, () => {
  console.log('Server listening on http://localhost:3000')
})