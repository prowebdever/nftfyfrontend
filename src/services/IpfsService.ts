import axios from 'axios'
import { getChainConfigById } from '../config'
import { code } from '../messages'
import { notifyError } from './NotificationService'

export interface IpfsFileResponse {
  cid?: string
  error?: string
}

interface IpfsService {
  uploadToIpfs(data: Blob, image?: File, video?: File | undefined, audio?: File): Promise<IpfsFileResponse>
}

export const PinataIpfsService = (chainId: number): IpfsService => {
  const { pinataBaseUrl } = getChainConfigById(chainId)

  return {
    async uploadToIpfs(data, image, video, audio): Promise<IpfsFileResponse> {
      const formData = new FormData()
      formData.append('metadata', data)

      if (image && !video && !audio) {
        formData.append('media', image)
      }

      if (image && audio) {
        formData.append('preview', image)
        formData.append('media', audio)
      }

      if (image && video) {
        formData.append('preview', image)
        formData.append('video', video)
      }

      const headers = {
        'Content-Type': `multipart/form-data`
      }

      const request = await axios.post(pinataBaseUrl, formData, { maxBodyLength: Infinity, headers })

      if (!request.data) {
        notifyError(code[5011])
        return { error: 'Request failed' }
      }

      const uploadResponse = request.data
      console.log(uploadResponse)
      return {
        cid: "uploadResponse.cid",
        error: "uploadResponse.error"
      }
    }
  }
}
