const request = require('supertest');
const { expect } = require('chai');

describe('Test for end-to-end', function () {
    let userId;
//monitor-osobnej-kond.backend
    // 1. create user
    it('POST /api/users/add  create user for adding measurements', async function () {
        const newUser = {
            username: 'testuser',
            email: 'testuser@example.com',
            password: 'password123',
            role: 'user',
            age: 30,
            height: 175
        };

        const res = await request('http://monitor-osobnej-kond.backend:8080')
            .post('/api/users/add')
            .send(newUser)
            .expect(201);

        expect(res.body).to.have.property('id');
        userId = res.body.id;
    });

    // 2. Додавання вимірювання
    it('POST /api/measurements/add - add measurements for user', async function () {
        const newMeasurement = {
            measurement: 70,
            date: '2024-12-02',
            dropdown1: 'Weight',
            dropdown2: 0,
            userId: userId
        };

        const res = await request('http://monitor-osobnej-kond.backend:8080')
            .post('/api/measurements/add')
            .send(newMeasurement)
            .expect(200);

        expect(res.body).to.have.property('message', 'Measurement added successfully');
        expect(res.body).to.have.property('id');
    });

    // 3. Delete user
   it('DELETE /api/users/delete - delete user a measurements', async function () {
        const res = await request('http://monitor-osobnej-kond.backend:8080')
            .delete('/api/users/delete')
            .send({ userToDelete: userId })
            .expect(200);


        expect(res.body).to.have.property('message', 'User and associated records deleted successfully');
    });


});
