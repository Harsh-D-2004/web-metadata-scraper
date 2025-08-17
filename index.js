import express from "express";
import { PrismaClient } from '@prisma/client'
import { getMetadata } from "./services.js";
import { websiteAPILimiter } from "./ratelimiter.js";

const app = express();
const prisma = new PrismaClient()

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});


app.post("/website" , websiteAPILimiter, async (req, res) => {
    try {
        const { url } = req.body;
        
        const web = await prisma.website.findFirst({
            where: {
                url: url,
            },
        });

        if (web) {
            res.status(201).send(web);
            return;
        }

        if (!url) {
            res.status(400).send("Missing url");
            return;
        }

        const metadata = await getMetadata(url);
        console.log("Metadata: ", metadata);

        const brand_name = metadata.brand_name;
        const description = metadata.description;
        
        const website = await prisma.website.create({
            data: {
            url: url,
            brand_name: brand_name,
            description: description,
            },
        });
        res.status(201).json(website);

    } catch (error) {
        res.status(500).send("Internal server error");
    }
});

app.get("/website", async (req, res) => {
    try {
        const websites = await prisma.website.findMany();

        if(!websites) {
            res.status(404).send("No websites found");
            return;
        }
        res.send(websites).status(200);
    } catch (error) {
        res.status(500).send("Internal server error");
    }
});

app.put("/website/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { brand_name, description } = req.body;

        if (!id) {
            res.status(400).send("Missing id");
            return;
        }

        if (!brand_name && !description) {
            res.status(400).send("Missing brand_name or description");
            return;
        }

        const website = await prisma.website.update({
            where: {
                id: parseInt(id),
            },
            data: {
                brand_name: brand_name,
                description: description,
            },
        });
        res.send(website).status(200);
    } catch (error) {
        res.status(500).send("Internal server error");
    }
});

app.delete("/website/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            res.status(400).send("Missing id");
            return;
        }

        const website = await prisma.website.delete({
            where: {
                id: parseInt(id),
            },
        });
        res.send(website).status(200);
    } catch (error) {
        res.status(500).send("Internal server error");
    }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});