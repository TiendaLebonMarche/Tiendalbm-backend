import { AbstractFileProviderService, MedusaError } from '@medusajs/framework/utils';
import { Logger } from '@medusajs/framework/types';
import {
  ProviderUploadFileDTO,
  ProviderDeleteFileDTO,
  ProviderFileResultDTO,
  ProviderGetFileDTO,
} from '@medusajs/framework/types';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

type InjectedDependencies = {
  logger: Logger
}

interface CloudinaryServiceConfig {
  cloud_name: string
  api_key: string
  api_secret: string
  secure?: boolean
}

/**
 * Service to handle file storage using Cloudinary.
 */
class CloudinaryFileProviderService extends AbstractFileProviderService {
  static identifier = 'cloudinary-file'
  protected readonly config_: CloudinaryServiceConfig
  protected readonly logger_: Logger

  constructor({ logger }: InjectedDependencies, options: CloudinaryServiceConfig) {
    super()
    this.logger_ = logger
    this.config_ = options

    cloudinary.config({
      cloud_name: options.cloud_name,
      api_key: options.api_key,
      api_secret: options.api_secret,
      secure: options.secure !== false
    })

    this.logger_.info(`Cloudinary service initialized for cloud: ${options.cloud_name}`)
  }

  static validateOptions(options: Record<string, any>) {
    const requiredFields = ['cloud_name', 'api_key', 'api_secret']
    requiredFields.forEach((field) => {
      if (!options[field]) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `${field} is required in the Cloudinary provider's options`
        )
      }
    })
  }

  async upload(file: ProviderUploadFileDTO): Promise<ProviderFileResultDTO> {
    if (!file) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, 'No file provided')
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'medusa-media',
          public_id: file.filename.split('.')[0]
        },
        (error, result) => {
          if (error) {
            this.logger_.error(`Cloudinary upload failed: ${error.message}`)
            return reject(new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `Cloudinary upload failed: ${error.message}`))
          }
          if (!result) {
            return reject(new MedusaError(MedusaError.Types.UNEXPECTED_STATE, 'Cloudinary upload failed: No result'))
          }
          resolve({
            url: result.secure_url,
            key: result.public_id
          })
        }
      )

      if (Buffer.isBuffer(file.content)) {
        const stream = new Readable()
        stream.push(file.content)
        stream.push(null)
        stream.pipe(uploadStream)
      } else if (typeof file.content === 'string') {
        const buffer = Buffer.from(file.content, 'base64')
        const stream = new Readable()
        stream.push(buffer)
        stream.push(null)
        stream.pipe(uploadStream)
      } else {
        // Assume it's already a stream or compatible
        (file.content as any).pipe(uploadStream)
      }
    })
  }

  async delete(fileData: ProviderDeleteFileDTO): Promise<void> {
    if (!fileData?.fileKey) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, 'No file key provided')
    }

    try {
      await cloudinary.uploader.destroy(fileData.fileKey)
      this.logger_.info(`Deleted file ${fileData.fileKey} from Cloudinary`)
    } catch (error) {
      this.logger_.warn(`Failed to delete file ${fileData.fileKey}: ${error.message}`)
    }
  }

  async getPresignedDownloadUrl(fileData: ProviderGetFileDTO): Promise<string> {
    // Cloudinary URLs are generally public or can be generated with a signature
    // For simplicity, we return the secure URL if we have it, or generate one
    return cloudinary.url(fileData.fileKey, { secure: true })
  }
}

export default CloudinaryFileProviderService;
