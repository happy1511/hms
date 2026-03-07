import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { Location } from "@/generated/prisma/client";

const filePath = path.join(process.cwd(), "data/india_locations.csv");

const results: Omit<Location, "id">[] = [];

fs.createReadStream(filePath)
  .pipe(csv())
  .on("data", (row) => {
    const city = row.district;
    const state = row.statename;
    const postcode = row.pincode;

    if (city && state && postcode) {
      results.push({
        city: city.toString().trim(),
        state: state.toString().trim(),
        country: "India",
        postcode: postcode.toString().trim(),
        isDeleted: false,
        createdBy: null,
        updatedBy: null,
        deletedBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  })
  .on("end", () => {
    // Remove duplicates (city + postcode)
    const map = new Map();

    results.forEach((item) => {
      const key = `${item.city}-${item.postcode}`;
      if (!map.has(key)) {
        map.set(key, item);
      }
    });

    const finalData = Array.from(map.values());

    fs.writeFileSync(
      path.join(process.cwd(), "prisma/india-locations.json"),
      JSON.stringify(finalData, null, 2),
    );

    console.log("✅ JSON created:", finalData.length);
  });
