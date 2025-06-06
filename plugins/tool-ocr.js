import { uploadPomf } from '../lib/uploadImage.js'
import ocrapi from 'ocr-space-api-wrapper'

async function performOCR(url) {
  try {
    return await ocrapi.ocrSpace(url)
  } catch (error) {
    console.error(error)
    return null
  }
}

let handler = async (m, { conn, text, command, usedPrefix }) => {
  try {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (!mime) throw `Balas gambar dengan perintah ${usedPrefix}${command}`
    if (!/image\/(jpe?g|png)/.test(mime)) throw `Jenis ${mime} tidak didukung`

    let img = await q.download()
    let url = await uploadPomf(img)

    m.reply(wait)

    let maxRetries = 99
    let retryCount = 0
    let hasil

    do {
      hasil = await performOCR(url)
      retryCount++
    } while (!hasil && retryCount < maxRetries)

    if (hasil && hasil.ParsedResults && hasil.ParsedResults.length > 0) {
      let parsedText = hasil.ParsedResults[0].ParsedText;
      await m.reply(`${parsedText}`);
    } else {
      throw 'Tidak dapat menemukan teks dalam gambar'
    }
  } catch (error) {
    console.error(error)
    m.reply(`Balas gambar dengan perintah ${usedPrefix}${command}`)
  }
}

handler.help = ['ocr']
handler.tags = ['tools']
handler.command = /^(ocr|totext)$/i

export default handler