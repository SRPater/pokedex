import { redirect } from "next/navigation";
import { getSpeciesList } from "@/lib/pokeapi";

// A static "random" segment wins over [slug], so this doesn't clash with the detail page.
export async function GET() {
  const { count } = await getSpeciesList(1, 0);
  const id = Math.floor(Math.random() * count) + 1;

  // /pokemon/<number> already redirects to the name URL.
  redirect(`/pokemon/${id}`);
}
