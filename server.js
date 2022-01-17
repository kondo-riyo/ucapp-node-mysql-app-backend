const express = require('express')
const mysql = require('mysql');
// const bodyParser = require('body-parser')
const app = express()

const port = process.env.PORT || 5000;

const bcrypt = require('bcrypt');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/img', express.static(__dirname + '/dist/img/'));
app.use('/css', express.static(__dirname + '/dist/css/'));
app.use('/js', express.static(__dirname + '/dist/js/'));
app.get('/', (req, res) => res.sendFile(__dirname + '/dist/index.html'))

//mysqlへのコネクションの準備
    const connection = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '17939176',
      database: 'ucapp_app_db'
    });

//MySQLへの接続ができていない時にエラーを表示
    connection.connect((err) => {
        if (err) {
            console.log('error connecting: ' + err.stack);
            return;
        }
        console.log('success');
    });

//usersテーブルの中身全て取得-----------------------------------------
    app.get('/api/users', (req, res) => {
        connection.query('SELECT * FROM users',
            (error, results) => {
                res.send(results);
                console.log(results)
            }
        );
    });

    //ログイン(vue側とdb側のパスワードが一致しているアカウントをdbから取得)--------------------
app.post('/api/login', (req, res) => {
        const sqlGet = `select * from users where mail=?`;
    // const params = req.body
        connection.query(sqlGet,[req.body.mail],
            async (error, results) => {
                const hash_result = await bcrypt.compare(req.body.password, results[0].password)
                if (!hash_result ) {
                    res.send({
                        msg: 'パスワードが違います!!!!',
                        user: null
                    })
                } else {
                    res.send({
                        msg: '',
                        user: results
                    });
                }
                });
            }
        );
    // });
    //usersテーブルに追加---------------------------------------
app.post('/api/signIn', (req, res) => {
        //パスワードのハッシュ化-------------
    // const bcrypt = require('bcrypt');
    const params = req.body;
    let hashed_password = bcrypt.hashSync(params.password, 10);
    console.log(hashed_password);
        const sqlInsert = `INSERT INTO users VALUES (?,?,?,?)`;
        connection.query(sqlInsert, [params.userId, params.userName, params.mail, hashed_password], (err,result)=>{
            res.send(result);
    });
    });

    //usersテーブルからuser削除--------------------------------------
    app.delete('/api/deleteUser', (req, res) => {
        const params = req.query;
        const sqlDelete = `DELETE FROM users WHERE userId=?`;
        connection.query(sqlDelete, params.id, (err, result) => {
            res.send(result);
        });
    });
    
    //usersテーブルの何か変更(update)-------------------------------
    app.post('/api/updateUser', (req, res) => {
        const params = req.body;
        const sqlUpdate = `UPDATE users SET userName=? WHERE userId=?`;
        connection.query(sqlUpdate, [params.userName, params.userId], (err, result) => {
            res.send(result);
        })
    });
    //costsテーブルの中身を取得---------------------------------------
    app.get('/api/costs', (req, res) => {
        connection.query('SELECT * FROM costs',
            (error, results) => {
                res.send(results);
            }
        );
    });
    //costsテーブルに追加----------------------------------------------
    app.post('/api/addCosts', (req, res) => {
        const params = req.body;
        const sqlInsert = `INSERT INTO costs VALUES (?,?,?,?,?,?,?,?,?,?)`;
        connection.query(sqlInsert, [
            params.costId,
            params.year,
            params.month,
            params.color,
            params.waterCost,
            params.eleCost,
            params.gasCost,
            params.totalCost,
            params.addDate,
            params.userId
        ], (err, result) => {
            res.send(result);
        });
    });
    //costsテーブルのデータを変更(update)-----------------------------------
    app.post('/api/updateCost', (req, res) => {
        const params = req.body;
        const sqlUpdate = `UPDATE costs SET waterCost=?, gasCost=?, eleCost=?, totalCost=?, addDate=? WHERE costId=?`;
        connection.query(sqlUpdate, [params.waterCost, params.gasCost, params.eleCost, params.totalCost, params.addDate, params.costId], (err, result) => {
            res.send(result);
        })
    });
    //costsテーブルのcostデータを削除(delete)---------------------------------------
    app.delete('/api/deleteCost', (req, res) => {
        const params = req.query;
        console.log(params)
        const sqlDelete = `DELETE FROM costs WHERE costId=?`;
        connection.query(sqlDelete, params.id, (err, result) => {
            res.send(result);
        });
    });

// app.listen(3000, () => console.log('Example app listening on port 3000!'))
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

