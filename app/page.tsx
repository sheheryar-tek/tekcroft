import fs from "fs";
import path from "path";
import Homepage from "@/components/Homepage";

export default function HomePage() {
  const html = fs.readFileSync(
    path.join(process.cwd(), "lib", "homepage-body.html"),
    "utf8"
  );

  return <Homepage html={html} />;
}
