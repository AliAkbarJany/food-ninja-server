const express = require('express')
const cors = require('cors')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


/*  
DB_USER=food_ninja_admin
DB_PASS=CCJcGAfBBb63WHDT 
*/

app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cegvgin.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

    try {
        await client.connect()
        console.log('DataBase connected')
        const usersCollection = client.db("all_users").collection("users");

        const restaurantCollection = client.db("restaurants_db").collection("restaurants");

        /* .........................................................
        .............Starting to Create/Put  (users) section........
        ..........................................................*/
        // Put/Create .....(users)
        app.put("/users/:email", async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            console.log("user information", user);
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await usersCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            res.send(result);
        });

        // Get/Read (allUsers)....
        app.get("/allUsers", async (req, res) => {
            const totalUsers = await usersCollection.find().toArray();
            res.send(totalUsers);
        });



        /* .........................................................
        .............(ADMIN ) section  Start........
        ..........................................................*/
        // Create .... (ADMIN)
        app.put("/users/admin/:email", async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            // const options = { upsert: true };
            const updateDoc = {
                $set: { role: "admin" },
            };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result);
        });

        // Delete (user)
        app.delete("/deleteUsers/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(query);
            res.send(result);
        });

        /*...........(ADMIN)....SEction (END)..........*/


        // Create New Restaurants
        app.put("/restaurant/:email", async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const application = req.body;
            const options = { upsert: true };
            const updateDoc = {
                $set: application,
            };
            const result = await restaurantCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            res.json({ success: true, restaurant: result });
        });


    }

    finally {
        // await client.close()
    }

}
run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('Welcome to FOOD-NINja')
})
app.listen(port, () => {
    console.log(`Listenin to port ${port}`)
})