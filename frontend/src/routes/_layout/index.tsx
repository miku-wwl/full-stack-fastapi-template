import { createFileRoute } from "@tanstack/react-router";
import Home from "@/pages/Dashboard/Home";
export const Route = createFileRoute("/_layout/")({ component: Home });
