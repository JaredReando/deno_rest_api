import { Application } from './deps.ts'
import router from './routes.ts';


const port = Deno.env.get("PORT") || 9999;

const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());

console.log("Server running on port " + port)
await app.listen({
    //converts to number if .env.get returns a string value
    port: +port
})
