import { 
  Controller, 
  Post, 
  UseInterceptors, 
  UploadedFile, 
  BadRequestException, 
  InternalServerErrorException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { R2 } from "../services/cloudflare.service";

@Controller('cloudflare') // Define a rota base como /cloudflare (ou deixe vazio para /)
export class CloudflareController {

  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // 'file' é o nome do campo no FormData
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("O arquivo não foi enviado.");
    }

    try {
      const command = new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: file.originalname,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      const response = await R2.send(command);

      return { 
        message: "Arquivo enviado com sucesso", 
        response 
      };
    } catch (error) {
      console.error("Erro no envio para R2:", error);
      
      throw new InternalServerErrorException({
        error: "O envio do arquivo falhou.",
        details: error instanceof Error ? { message: error.message } : error,
      });
    }
  }
}