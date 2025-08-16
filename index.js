import express from "express";
import { PrismaClient } from '@prisma/client'

const app = express();
const prisma = new PrismaClient()

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});


app.post("/website" , async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            res.status(400).send("Missing url");
            return;
        }

        brand_name = "xxx";
        description = "xxx";
        
        const website = await prisma.website.create({
            data: {
            url: url,
            brand_name: brand_name,
            description: description,
            },
        });
        res.send(website).status(201);
    } catch (error) {
        res.status(500).send("Internal server error");
    }
});


app.listen(3000, () => {
  console.log("Server is running on port 3000");
});