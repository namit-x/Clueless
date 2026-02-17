"use server"

export async function submitName(formdata: FormData) {
    const name = formdata.get('name');
    console.log(name);
}
