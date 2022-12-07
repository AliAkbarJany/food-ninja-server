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
        const mealCollection = client.db("restaurants_db").collection("meals");
        const categoryCollection = client.db("restaurants_db").collection("category");

        /* .........................................................
        .............Starting to Create/Put  (users) section........
        ..........................................................*/
        // Put/Create .....(users)
        // (useToken.js).....
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

        // Get/Read (allUsers)....for (Deleting users & Making Admin )
        // (AllUsers.js)........
        app.get("/allUsers", async (req, res) => {
            const totalUsers = await usersCollection.find().toArray();
            res.send(totalUsers);
        });


        /* .........................................................
        .............(ADMIN ) section  Start........
        ..........................................................*/

        // Create .... (ADMIN)
        // (UsersRow.js).........
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
        // (UsersRow.js).........
        app.delete("/deleteUsers/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(query);
            res.send(result);
        });

        /*...........(ADMIN)....SEction (END)..........
        ...............................................
        ..............................................*/


        // Create New (Restaurants/Merchants)
        // (Merchant.js)......
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

        // Get All Restaurants Info
        // (MakeVendor.js)......
        app.get("/restaurants", async (req, res) => {
            const query = { applicationStatus: "pending" };
            const totalRestaurants = await restaurantCollection.find(query).toArray();

            res.json(totalRestaurants);
        });

        // Approve vendor role//admin role entry update//
        // (MakeVendor.js).....
        app.patch("/restaurant/:email", async (req, res) => {
            const email = req.params.email;
            const restaurantId = req.body.restaurantId;
            // const userAccount = await restaurantCollection.findOne({
            //     email: email,
            // });
            // if (userAccount) {
            //     const filter = { email: email };
            //     const updateDoc = {
            //         $set: {
            //             role: "vendor",
            //             applicationStatus: "approved",
            //             restaurant_id: restaurantId,
            //         },
            //     };
            //     const result = await restaurantCollection.updateOne(filter, updateDoc);

            //     res.send(result);
            // } 
            // else {
            //     res.status(403).send({ message: "Forbidden 403" });
            // }

            const filter = { email: email };
            const updateDoc = {
                $set: {
                    role: "vendor",
                    applicationStatus: "approved",
                    restaurant_id: restaurantId,
                },
            };
            const result = await restaurantCollection.updateOne(filter, updateDoc);

        });

        // Get Own Restaurants Info
        // (Merchant.js)......
        // (AddMenu.js).......
        app.get("/restaurant", async (req, res) => {
            const restaurantId = req.query.restaurantId;
            const query = { email: restaurantId };
            const restaurant = await restaurantCollection.findOne(query);
            res.json(restaurant);
        });



        // Get All approved Restaurants Info
        // (AllVendors.js)........
        app.get("/restaurants/vendor", async (req, res) => {
            const query = { applicationStatus: "approved" };
            const totalRestaurants = await restaurantCollection.find(query).toArray();

            res.json(totalRestaurants);
        });

        //Remove vendor role//admin role entry update
        // (AllVendors.js)........
        app.delete("/restaurant/vendor/:email", async (req, res) => {
            const email = req.params.email;

            const userAccount = await restaurantCollection.findOne({
                email: email,
            });
            if (userAccount) {
                const filter = { email: email };
                const updateDoc = {
                    $unset: { role: "vendor" },
                    $set: { applicationStatus: "pending" },
                };
                const result = await restaurantCollection.updateOne(filter, updateDoc);

                res.send(result);
            } else {
                res.status(403).send({ message: "Forbidden 403" });
            }
        });

        // for super admin(useAdmin)....
        app.get("/admin/:email", async (req, res) => {
            const email = req.params.email;
            const user = await usersCollection.findOne({ email: email });
            const isAdmin = user?.role === "admin";
            res.send({ admin: isAdmin });
        });

        //for admins (useVendor)
        app.get("/vendor/:email", async (req, res) => {
            const email = req.params.email;
            const user = await restaurantCollection.findOne({ email: email });
            const isAdmin = user?.role === "vendor";
            res.send({ vendorAdmin: isAdmin });
        });



        /*............. Mnus Section (START).........
        .................................................*/

        // REstaurat Owner//Vendor (add menu items)
        // (AddMenu.js)..........
        app.post("/meal", async (req, res) => {
            const data = req.body;
            const result = await mealCollection.insertOne(data);
            res.send({ success: true, meal: result });
        });

        // Restaurant Ownwr/Vendor Add Category
        // (AddMenu.js)..........
        app.post("/category", async (req, res) => {
            const data = req.body;
            const result = await categoryCollection.insertOne(data);
            res.send({ success: true, category: result });
        });

        // Get/Read all Categories..
        // (AddMenu.js)..........
        app.get("/category", async (req, res) => {
            const query = {};
            const cursor = categoryCollection.find(query);
            const category = await cursor.toArray();
            res.send(category);
        });

        /*............. Mnus Section (END).........
        .................................................*/







        /*.......... DELETE (MENU) section Start.................*/

        // Get specific (menu Items)

        // (ManageItems.js........)
        app.get("/menus/:email", async (req, res) => {
            const email = req.params.email
            const query = { "restaurantInfo.email": email }
            const cursor = mealCollection.find(query);
            const menus = await cursor.toArray();
            res.send(menus)
        });

        // Delete (Menus)
        // (ManageItems.js........)
        app.delete("/deleteMenus/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await mealCollection.deleteOne(query);
            res.send(result);
        });

        /*.......... DELETE (MENU) section End.................*/


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