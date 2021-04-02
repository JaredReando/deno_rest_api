const cwd = await Deno.cwd();

export const getWorkingDirectory = ({response}: {response: any}) => {
    response.body = {
        success: true,
        data: cwd,
    }

}