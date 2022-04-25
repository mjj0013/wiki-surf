import "regenerator-runtime/runtime"
export async function sendRequestToBackend(req) {
    const response = await fetch(req);
    const body = await response.json();
    if(response.status!==200) throw Error(body.message);
    return body;
}
