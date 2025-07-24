// Test the regex patterns for parsing transfer lines
const testInput = "Sean Longstaff has officially joined Leeds United from Newcastle in a deal worth around £12 million";

console.log("Testing input:", testInput);
console.log("Input length:", testInput.length);

// Current regex pattern
const joinedRegex = /^(.*?)\s+has\s+(?:officially\s+)?joined\s+(.+?)\s+from\s+(.+?)(?:\s+(?:for|in\s+a\s+deal\s+worth\s+(?:around\s+)?|worth\s+(?:around\s+)?)(.+?))?(?:[,.]\s*)?$/i;

console.log("\n=== Testing current regex ===");
const match = testInput.match(joinedRegex);
console.log("Match result:", match);

if (match) {
  console.log("Player:", match[1]?.trim());
  console.log("To Club:", match[2]?.trim());
  console.log("From Club:", match[3]?.trim());
  console.log("Fee:", match[4]?.trim());
} else {
  console.log("No match found!");
}

// Let's try a simpler regex first
console.log("\n=== Testing simpler regex ===");
const simpleRegex = /^(.*?)\s+has\s+(?:officially\s+)?joined\s+(.+?)\s+from\s+(.+?)(?:\s+in\s+a\s+deal\s+worth\s+around\s+(.+?))?$/i;
const simpleMatch = testInput.match(simpleRegex);
console.log("Simple match result:", simpleMatch);

if (simpleMatch) {
  console.log("Player:", simpleMatch[1]?.trim());
  console.log("To Club:", simpleMatch[2]?.trim());
  console.log("From Club:", simpleMatch[3]?.trim());
  console.log("Fee:", simpleMatch[4]?.trim());
}

// Test even more basic
console.log("\n=== Testing basic regex ===");
const basicRegex = /^(.*?)\s+has\s+officially\s+joined\s+(.+?)\s+from\s+(.+?)$/i;
const basicMatch = testInput.match(basicRegex);
console.log("Basic match result:", basicMatch);

if (basicMatch) {
  console.log("Player:", basicMatch[1]?.trim());
  console.log("To Club:", basicMatch[2]?.trim());
  console.log("From Club:", basicMatch[3]?.trim());
}
