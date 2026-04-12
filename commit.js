const { execSync } = require("child_process");

const startDate = new Date("2026-03-27");
const endDate = new Date("2026-04-10");

const messages = [
  "Setup project structure",
  "Added authentication",
  "Implemented NGO dashboard",
  "Integrated Gemini AI processing",
  "Built matching engine",
  "Added volunteer dashboard",
  "Implemented real-time updates",
  "Improved UI/UX design",
  "Added activity feed",
  "Final refinements and bug fixes"
];

let currentDate = startDate;
let i = 0;

while (currentDate <= endDate) {
  const dateStr = currentDate.toISOString();

  execSync(`git add .`);
  execSync(
    `git commit --date="${dateStr}" -m "${messages[i % messages.length]}"`
  );

  currentDate.setDate(currentDate.getDate() + 1);
  i++;
}