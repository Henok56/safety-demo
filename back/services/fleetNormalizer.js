const normalizeFleet = (acType) => {
  if (!acType) return "UNMAPPED";

  const clean = acType
    .toUpperCase()
    .replace(/\s/g, "")
    .replace(/\(.*\)/g, ""); // remove (MAX), etc

  if (clean.startsWith("A350")) return "A-350";
  if (clean.startsWith("B737")) return "B-737";
  if (clean.startsWith("B767")) return "B-767";
  if (clean.startsWith("B777")) return "B-777";
  if (clean.startsWith("B787")) return "B-787";
  if (clean.startsWith("DASH8") || clean.startsWith("DASH8Q400")) return "Q-400";

  return "UNMAPPED";
};

module.exports = normalizeFleet;