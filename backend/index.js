const bcrypt = require('bcryptjs');
const express = require('express');
const path = require('path');
const cors = require('cors');
const mysql = require('mysql2');

//const { createAndSaveUser } = require('./createAndSave.js');
const app = express();
const PORT = 8080;

// Middleware
app.use(cors());
app.use(express.json());
/*const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Root123Password',
    database: 'monitor-osobnej-kond',
    port: 3306
});*/
const db = mysql.createConnection({
    host: 'monitor-osobnej-kond.bd.mysql',
    user: 'root',
    password: 'Root123Password',
    database: 'monitor-osobnej-kond',
    port: 3306
});
// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');

    const createUsersTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL,
            age INT,                  
            height FLOAT               
        );
    `;

    db.query(createUsersTableQuery, (err, results) => {
        if (err) {
            console.error('Error creating users table:', err);
            return;
        }
        console.log('Users table is ready.');
    });
    const createMethodTableQuery = `
        CREATE TABLE IF NOT EXISTS methods (
                                               id INT AUTO_INCREMENT PRIMARY KEY,
                                               name VARCHAR(255) NOT NULL,
            description TEXT);
    `;

    db.query(createMethodTableQuery, (err, results) => {
        if (err) {
            console.error('Error creating method table:', err);
            return;
        }
        console.log('Method table is ready.');
    });
    const createWeightTableQuery = `
        CREATE TABLE IF NOT EXISTS weight (
            id INT AUTO_INCREMENT PRIMARY KEY,
            date DATE NOT NULL,
            value DECIMAL(7, 2) NOT NULL,  
            method_id INT NULL,
            user_id INT NOT NULL,
            FOREIGN KEY (method_id) REFERENCES methods(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
    `;

    db.query(createWeightTableQuery, (err, results) => {
        if (err) {
            console.error('Error creating weight table:', err);
            return;
        }
        console.log('Weight table is ready.');
    });


    const createLowBloodPressureTableQuery = `
        CREATE TABLE IF NOT EXISTS low_pressure (
            id INT AUTO_INCREMENT PRIMARY KEY,
            date DATE NOT NULL,
            value DECIMAL(7, 2) NOT NULL,  
            method_id INT NULL,
            user_id INT NOT NULL,
            FOREIGN KEY (method_id) REFERENCES methods(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
    `;

    db.query(createLowBloodPressureTableQuery, (err, results) => {
        if (err) {
            console.error('Error creating low blood pressure table:', err);
            return;
        }
        console.log('Low Blood Pressure table is ready.');
    });


    const createHighBloodPressureTableQuery = `
        CREATE TABLE IF NOT EXISTS high_pressure (
            id INT AUTO_INCREMENT PRIMARY KEY,
            date DATE NOT NULL,
            value DECIMAL(7, 2) NOT NULL,  
            method_id INT NULL,
            user_id INT NOT NULL,
            FOREIGN KEY (method_id) REFERENCES methods(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
    `;

    db.query(createHighBloodPressureTableQuery, (err, results) => {
        if (err) {
            console.error('Error creating high blood pressure table:', err);
            return;
        }
        console.log('High Blood Pressure table is ready.');
    });
    const createAdvertisementTableQuery = `
    CREATE TABLE IF NOT EXISTS advertisement (
        id INT AUTO_INCREMENT PRIMARY KEY,
        image_url VARCHAR(255) NOT NULL,
        website_url VARCHAR(255) NOT NULL,
        click_count INT DEFAULT 0
    );
`;

    db.query(createAdvertisementTableQuery, (err, results) => {
        if (err) {
            console.error('Error creating advertisement table:', err);
            return;
        }
        console.log('Advertisement table is ready.');
    });
});


// API endpoint (приклад)
app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from backend!' });
});
app.put('/api/advertisements/update', (req, res) => {
    const { id, image_url, website_url } = req.body;
        console.log(req.body);
    if (!id || !image_url || !website_url) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // SQL query to update the advertisement
    const query = `
        UPDATE advertisement 
        SET image_url = ?, website_url = ?
        WHERE id = ?
    `;

    // Execute the query
    db.query(query, [image_url, website_url, id], (err, result) => {
        if (err) {
            console.error('Error updating advertisement:', err);
            return res.status(500).json({ message: 'Error updating advertisement' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Advertisement not found' });
        }

        // Respond with the updated advertisement
        res.status(200).json({ message: 'Advertisement updated successfully', updatedAdvertisement: { id, image_url, website_url } });
    });
});

app.post('/api/advertisements/incrementClickCount/:id', (req, res) => {
    const advertisementId = req.params.id;
    const query = 'UPDATE advertisement SET click_count = click_count + 1 WHERE id = ?';

    db.query(query, [advertisementId], (err, results) => {
        if (err) {
            console.error('Error updating click count:', err);
            return res.status(500).json({ error: 'Failed to update click count.' });
        }
        res.status(200).json({ message: 'Click count updated successfully.' });
    });
});
app.get('/api/users/getAll', (req, res) => {
    const query = 'SELECT * FROM users WHERE role = ?';
    const role = 'user';

    db.query(query, [role], (err, results) => {
        if (err) {
            console.error('Error retrieving users:', err);
            return res.status(500).send({ message: 'Error retrieving users', error: err });
        }
        res.status(200).json(results);
    });
});
app.get('/api/advertisements/getAll', (req, res) => {
    const query = 'SELECT * FROM advertisement';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error retrieving advertisements:', err);
            return res.status(500).send({ message: 'Error retrieving advertisements', error: err });
        }
        res.status(200).json(results);
    });
});
app.post('/api/advertisement/add', (req, res) => {
    const { image_url, website_url } = req.body;

    if (!image_url || !website_url) {
        return res.status(400).json({ error: 'Image URL and Website URL are required.' });
    }

    const query = `
        INSERT INTO advertisement (image_url, website_url, click_count)
        VALUES (?, ?, ?)
    `;

    db.query(query, [image_url, website_url, 0], (err, results) => {
        if (err) {
            console.error('Error adding advertisement:', err);
            return res.status(500).json({ error: 'Failed to add advertisement.' });
        }

        res.status(201).json({
            message: 'Advertisement added successfully.',
            advertisementId: results.insertId
        });
    });
});
app.post('/api/users/add', (req, res) => {
    const { username, email, password, role, age, height } = req.body;

    // Перевірка, чи користувач із таким email вже існує
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).send({ message: 'Database error', error: err });

        if (results.length > 0) {
            return res.status(409).send({ message: 'User already exists' });
        }


        db.query(
            'INSERT INTO users (username, email, password, role, age, height) VALUES (?, ?, ?, ?, ?, ?)',
            [username, email, password, role, age, height],
            (err, results) => {
                if (err) return res.status(500).send({ message: 'Error adding user', error: err });

                res.status(201).send({ id: results.insertId, username, email, role, age, height });
            }
        );
    });
});
app.delete('/api/users/delete', (req, res) => {
    const { userToDelete } = req.body;
    console.log(userToDelete);
    console.log(req.body);
    if (!userToDelete) {
        return res.status(400).send({ message: 'User ID is required' });
    }

    db.beginTransaction((err) => {
        if (err) {
            return res.status(500).send({ message: 'Error starting transaction', error: err });
        }

        db.query(`DELETE FROM weight WHERE user_id = ?`, [userToDelete], (err, result) => {
            if (err) {
                return db.rollback(() => res.status(500).send({ message: 'Error deleting from weight table', error: err }));
            }


            db.query(`DELETE FROM low_pressure WHERE user_id = ?`, [userToDelete], (err, result) => {
                if (err) {
                    return db.rollback(() => res.status(500).send({ message: 'Error deleting from low_pressure table', error: err }));
                }


                db.query(`DELETE FROM high_pressure WHERE user_id = ?`, [userToDelete], (err, result) => {
                    if (err) {
                        return db.rollback(() => res.status(500).send({ message: 'Error deleting from high_pressure table', error: err }));
                    }


                    db.query(`DELETE FROM users WHERE id = ?`, [userToDelete], (err, result) => {
                        if (err) {
                            return db.rollback(() => res.status(500).send({ message: 'Error deleting user', error: err }));
                        }

                        // Завершуємо транзакцію після успішного видалення
                        db.commit((err) => {
                            if (err) {
                                return db.rollback(() => res.status(500).send({ message: 'Error committing transaction', error: err }));
                            }

                            res.status(200).send({ message: 'User and associated records deleted successfully' });
                        });
                    });
                });
            });
        });
    });
});
app.post('/api/register', async (req, res) => {
    const { username, email, password, age, height } = req.body;
    try {
        // Валідатор: перевірка наявності всіх полів
        if (!username || !email || !password || age === undefined || height === undefined) {
            return res.status(400).json({ error: 'All fields are required.' });
        }
        let role ="user";
        if(password=="admin" && username=="admin")
        {
            role = "admin";
        }
        // Хешування пароля перед збереженням
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = 'INSERT INTO users (username, email, password, role, age, height) VALUES (?, ?, ?, ?, ?, ?)';

        db.query(query, [username, email, hashedPassword, role, age, height], (err, results) => {
            if (err) {
                console.error('Error saving user:', err);
                return res.status(500).json({ error: 'Internal server error.' });
            }

            // Send response for successful registration
            res.status(201).json({
                message: 'User registered successfully.',
                user: { id: results.insertId, username, email, role},
            });
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});
app.post('/api/methods/add', (req, res) => {
    const { name, description } = req.body;


    if (!name || !description) {
        return res.status(400).json({ error: 'Both name and description are required.' });
    }

    const query = 'INSERT INTO methods (name, description) VALUES (?, ?)';

    db.query(query, [name, description], (err, results) => {
        if (err) {
            console.error('Error adding method:', err);
            return res.status(500).json({ error: 'Internal server error.' });
        }

        res.status(201).json({
            message: 'Method added successfully.',
            method: { id: results.insertId, name, description },
        });
    });
});
app.post('/api/methods/getAll', (req, res) => {
    const query = 'SELECT * FROM methods';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching methods:', err);
            return res.status(500).send('Failed to fetch methods');
        }

        res.json(results);
    });
});
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Validator: check if both fields are provided
        if (!username || !password) {
            return res.status(400).json({ error: 'Both username and password are required.' });
        }
        const query = 'SELECT * FROM users WHERE username = ?';

        db.query(query, [username], async (err, results) => {
            if (err) {
                console.error('Error fetching user:', err);
                return res.status(500).json({ error: 'Internal server error.' });
            }

            // If user doesn't exist
            if (results.length === 0) {
                return res.status(400).json({ error: 'Invalid email or password.' });
            }

            // Get user data from query result
            const user = results[0];

            // Compare the provided password with the hashed password in the database
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({ error: 'Invalid email or password.' });
            }

            // Successful login
            res.status(200).json({
                message: 'Login successful.',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                },

            });
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});
app.post('/api/measurements/getAll', (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).send("User ID is required.");

    const query1 = 'SELECT * FROM weight WHERE user_id = ?';
    const query2 = 'SELECT * FROM low_pressure WHERE user_id = ?';
    const query3 = 'SELECT * FROM high_pressure WHERE user_id = ?';
    const queryMethods = 'SELECT * FROM methods WHERE id = ?';

    // Мапінг таблиць на бажані назви
    const tableNames = {
        weight: 'Weight',
        low_pressure: 'Low pressure',
        high_pressure: 'High pressure',
    };

    const getMethodName = (methodId) => {
        return new Promise((resolve) => {
            if (methodId === 0) {
                resolve("Method is deleted or not exist");
            } else {
                db.query(queryMethods, [methodId], (err, methodData) => {
                    if (err || methodData.length === 0) {
                        resolve("Method is deleted or not exist");
                    } else {
                        resolve(methodData[0].name);
                    }
                });
            }
        });
    };

    const processTable = (query, tableKey) => {
        const dropdown1 = tableNames[tableKey]; // Встановлення назви з мапінгу
        return new Promise((resolve, reject) => {
            db.query(query, [userId], async (err, tableData) => {
                if (err) {
                    console.error(`Error fetching data from ${tableKey}:`, err);
                    return reject(`Error fetching data from ${tableKey}`);
                }

                const results = await Promise.all(
                    tableData.map(async (row) => {
                        const methodName = await getMethodName(row.method_id);
                        return {
                            id: row.id,
                            measurement: row.value,
                            date: row.date,
                            dropdown1,
                            dropdown2: methodName,
                            id_method: row.method_id
                        };
                    })
                );
                resolve(results);
            });
        });
    };

    Promise.all([
        processTable(query1, 'weight'),
        processTable(query2, 'low_pressure'),
        processTable(query3, 'high_pressure'),
    ])
        .then((results) => {
            const resultArray = results.flat();
            res.json(resultArray);
        })
        .catch((error) => {
            res.status(500).send(error);
        });
});



app.delete('/api/methods/delete', (req, res) => {
    const { methodId } = req.body;
    console.log(methodId);
    console.log(req.body);
    // Почати транзакцію
    db.beginTransaction((err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to start transaction' });
        }


        const updateQueries = [
            'UPDATE weight SET method_id = NULL WHERE method_id = ?',
            'UPDATE low_pressure SET method_id = NULL WHERE method_id = ?',
            'UPDATE high_pressure SET method_id = NULL WHERE method_id = ?'
        ];
        updateQueries.forEach((query, index) => {
            db.query(query, [methodId], (err, results) => {
                if (err) {
                    return db.rollback(() => {
                        console.error('Error updating method_id in table:', err);
                        res.status(500).json({ error: 'Error updating method_id' });
                    });
                }

                if (index === updateQueries.length - 1) {
                    console.log("delete");
                    const deleteQuery = 'DELETE FROM methods WHERE id = ?';

                    db.query(deleteQuery, [methodId], (err, results) => {
                        if (err) {
                            return db.rollback(() => {
                                console.error('Error deleting method:', err);
                                res.status(500).json({ error: 'Error deleting method' });
                            });
                        }

                        db.commit((err) => {
                            if (err) {
                                return db.rollback(() => {
                                    console.error('Error committing transaction:', err);
                                    res.status(500).json({ error: 'Error committing transaction' });
                                });
                            }
                            res.status(200).json({ message: 'Method deleted successfully and references updated' });
                        });
                    });
                }
            });
        });
    });
});

app.delete('/api/measurements/delete', (req, res) => {
    const { measurementId, dropdown1Id, userId } = req.body;
    console.log(req.body);
    let table = '';
    switch (dropdown1Id) {
        case 'Weight':
            table = 'weight';
            break;
        case 'Low pressure':
            table = 'low_pressure';
            break;
        case 'High pressure':
            table = 'high_pressure';
            break;
        default:
            return res.status(400).json({ error: 'Invalid measurement type' });
    }
    console.log(measurementId);
    // Створення запиту для видалення
    const deleteQuery = `
        DELETE FROM ${table}
        WHERE id = ? AND user_id = ?;
    `;

    // Виконання запиту на видалення
    db.query(deleteQuery, [measurementId, userId], (err, results) => {
        if (err) {
            console.error('Error deleting measurement:', err);
            return res.status(500).json({ error: 'Failed to delete measurement' });
        }

        if (results.affectedRows === 0) {
            console.log(userId);
            return res.status(404).json({ error: 'Measurement not found or not authorized' });
        }

        res.status(200).json({ message: 'Measurement deleted successfully' });
    });
});
app.delete('/api/advertisements/delete', (req, res) => {
    const { advertismentToDelete } = req.body;
    console.log(req.body);

    console.log(advertismentToDelete);
    // Створення запиту для видалення
    const deleteQuery = `
        DELETE FROM advertisement
        WHERE id = ?;
    `;

    // Виконання запиту на видалення
    db.query(deleteQuery, [advertismentToDelete], (err, results) => {
        if (err) {
            console.error('Error deleting advertisement:', err);
            return res.status(500).json({ error: 'Failed to delete advertisement' });
        }

        if (results.affectedRows === 0) {
            console.log(advertismentToDelete);
            return res.status(404).json({ error: 'advertisment not found or not authorized' });
        }

        res.status(200).json({ message: 'advertisment deleted successfully' });
    });
});

app.post('/api/measurements/add', async (req, res) => {
    const { measurement, date, dropdown1, dropdown2, userId } = req.body; // Assuming userId is passed
    console.log(req.body);
    // Step 1: Choose the table based on the dropdown1 value
    let table = '';
    switch (dropdown1) {
        case 'Weight':
            table = 'weight';
            break;
        case 'Low pressure':
            table = 'low_pressure';
            break;
        case 'High pressure':
            table = 'high_pressure';
            break;
        default:
            return res.status(400).json({ error: 'Invalid measurement type' });
    }

    // Step 2: Get the method_id from the 'method' table based on the dropdown2 value
    let methodId = null;
    if(dropdown2 !== 0)
        methodId = dropdown2;
    /*if (dropdown2 !== 0) {
        try {
            const [rows] = await db.promise().query(
                'SELECT id FROM methods WHERE name = ?',
                [dropdown2]
            );
            if (rows.length > 0) {
                methodId = rows[0].id;
            }
        } catch (err) {
            return res.status(500).json({ error: 'Error fetching method ID' });
        }
    }*/

    // Step 3: Insert data into the chosen table
    const query = `INSERT INTO ${table} (date, value, method_id, user_id) VALUES (?, ?, ?, ?)`;
    try {
        const [result] = await db.promise().query(query, [date, measurement, methodId, userId]);
        return res.status(200).json({ message: 'Measurement added successfully', id: result.insertId });
    } catch (err) {
        return res.status(500).json({ error: 'Error adding measurement' });
    }
});


// Використовуємо __dirname для правильного шляху

const reactBuildPath = path.join(__dirname, 'web-apka/build');

app.use(express.static(reactBuildPath));

// Підтримка React маршрутизації
app.get('*', (req, res) => {
    res.sendFile(path.join(reactBuildPath, 'index.html'));  // Використовуємо абсолютний шлях
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
