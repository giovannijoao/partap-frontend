import { Box, Text } from '@chakra-ui/react'
import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import axios from "axios";
import { ApiInstance } from '../services/api';

export function DropToS3() {
  const onDrop = useCallback(async acceptedFiles => {
    const filesWithSignedURL = await Promise.all(acceptedFiles.map(file => ApiInstance.get('/file-upload', {
      params: {
        filename: file.name
      }
    }).then(res => ({
      file,
      signedUrl: res.data.data
    }))));
    const result = await Promise.all(filesWithSignedURL.map(async fileCtx => {
      console.log('Posting file', fileCtx)
      return await axios.put(fileCtx.signedURL, fileCtx.file, {
        headers: {
          'Content-Type': fileCtx.file.type,
        }
      });
    }))
    console.log(result);
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (
    <Box w="xs" {...getRootProps()}>
      <input {...getInputProps()} />
      <Box
        border="1px"
        borderColor={"gray.300"}
        borderRadius={"md"}
        padding={"2"}
        textAlign="center"
      >
        {
          isDragActive ?
            <Text>Coloque os arquivos arqui</Text> :
            <Text>Arraste e solte aqui arquivos<br/>ou clique para selecionar</Text>
        }
      </Box>
    </Box>
  )
}