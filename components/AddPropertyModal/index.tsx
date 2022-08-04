import { AttachmentIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { Button, Center, Flex, Icon, Image, Input, InputGroup, InputLeftAddon, InputLeftElement, InputRightAddon, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Text, Wrap } from "@chakra-ui/react";
import { useCallback, useEffect, useReducer, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { FaBed, FaCar, FaCouch, FaDog, FaDollarSign, FaHome, FaRuler, FaShower, FaSubway } from "react-icons/fa";
import useUser from "../../lib/useUser";
import { ApiInstance } from "../../services/api";

const formSteps = [
  'import',
  'basic_info',
  'secondary_info',
  'costs',
  'photos'
]

const allCostsTypes = [{
  "name": "costs.rentValue",
  "text": "Aluguel",
  availableIn: ['aluguel', 'both']
}, {
  "name": "costs.condominiumValue",
  "text": "Condomínio",
  availableIn: ['aluguel', 'compra', 'both']
}, {
  "name": "costs.iptuValue",
  "text": "IPTU",
  availableIn: ['aluguel', 'compra', 'both']
}, {
  "name": "costs.sellPrice",
  "text": "Compra",
  availableIn: ['compra', 'both']
}]

type IImage = {
  url: string,
  description?: string
}

export default function AddPropertyModal({
  isOpen,
  onClose,
}) {
  const { user } = useUser();
  const [importUrl, setImportUrl] = useState("");
  const [step, dispatchStep] = useReducer((state, action: 'next' | 'back' | 'start') => {
    let nextInd;
    if (action === 'next') {
      nextInd = formSteps.indexOf(state) + 1
    } else if (action === "back") {
      nextInd = formSteps.indexOf(state) - 1
    } else if (action === "start") {
      nextInd = 0;
    }
    return formSteps[nextInd]
  }, 'import')
  const [images, setImages] = useState<IImage[]>([{
    url: 'https://partap-files.s3.us-east-1.amazonaws.com/62bdd5f90499b44c99e9b3cc-2d83bc1f-17ce-48dc-9960-e5691fdc424e-Design%20sem%20nome%20%283%29.png'
  }]);
  const { register, handleSubmit: handleFormSubmit, reset, getValues, setValue, trigger,  } = useForm()
  useEffect(() => {
    if (!isOpen) {
      dispatchStep('start')
      reset({})
      setImages([])
      setImportUrl('')
    }
  }, [isOpen, reset])


  const handleImport = useCallback(async () => {
    try {
      const result = await ApiInstance.get(`/properties-extractor?url=${importUrl}`, {
        headers: {
          Authorization: user.token,
        },
      })
      console.log(result.data)
      reset(result.data.data)
      setImages(result.data.data.images)
      dispatchStep('next')
    } catch (error) {

    }
  }, [importUrl, reset, user?.token])

  const handleSubmit = useCallback((values) => {
    const newValues = {
      ...values,
      images,
    }
    console.log("submmited", newValues)
  }, [images]);

  const onDrop = useCallback(async acceptedFiles => {
    const formData = new FormData();
    acceptedFiles.forEach(file => {
      formData.append('photos', file)
    })
    const result = await ApiInstance.post('/file-upload', formData, {
      headers: {
        Authorization: user.token,
      },
    });
    console.log(result.data.map(x => ({
      url: x.location
    })))
    setImages(state => [...state, ...result.data.map(x => ({
      url: x.location
    }))])
  }, [user?.token])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const handleNextButton = useCallback(() => {

  }, [])

  const showNextStepButton = step !== "import" && step !== formSteps[formSteps.length - 1];
  const showBackButton = step !== 'basic_info' && step !== formSteps[0];
  const formValues = getValues();
  return <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>Adicionar propriedade</ModalHeader>
      <ModalCloseButton />
      <form onSubmit={handleFormSubmit(handleSubmit)}>
        <ModalBody>
          <ShowIf value={step === "import"}>
            <Text m={4} textAlign="center">Você pode importar de um site ou, se preferir, criar manualmente.</Text>
            <InputGroup>
              <InputLeftElement>
                <ExternalLinkIcon />
              </InputLeftElement>
              <Input placeholder='Importar de site' onChange={e => setImportUrl(e.target.value)} />
            </InputGroup>
          </ShowIf>
          <ShowIf value={step === "basic_info"}>
            <Flex direction="column" gap={2}>
              <Text>Informações básicas</Text>

              <InputGroup>
                <InputLeftElement>
                  <FaHome />
                </InputLeftElement>
                <Input id="endereco" type='text' placeholder='Endereço' {...register('address')} required />
              </InputGroup>
              <Flex gap={2}>
                <Select gridArea="modo" defaultValue="false" {...register('modo')} required>
                  <option value='aluguel'>Aluguel</option>
                  <option value='compra'>Compra</option>
                  <option value='both'>Ambos</option>
                </Select>
                <InputGroup w="fit-content">
                  <InputLeftElement
                    pointerEvents='none'
                  >
                    <FaRuler />
                  </InputLeftElement>
                  <Input textAlign="left" id="metragem" type='number' placeholder='0' {...register('information.totalArea')} />
                  <InputRightAddon>m²</InputRightAddon>
                </InputGroup>
              </Flex>
              <Flex justifyContent="space-around">
                {
                  [{
                    icon: FaBed,
                    text: 'Quartos',
                    id: 'information.bedrooms'
                  }, {
                    icon: FaShower,
                    text: 'Banheiros',
                    id: 'information.bathrooms'
                  }, {
                    icon: FaCar,
                    text: 'Vagas',
                    id: 'information.parkingSlots'
                  }].map(item => {
                    const Icon = item.icon;
                    return <Center
                      key={item.id}
                      flexDirection="column"
                      gap={1}
                      boxShadow={"md"}
                      p={4}
                      borderRadius="md"
                    >
                      <Flex alignItems="center" gap={2}>
                        <Icon />
                        <Text>{item.text}</Text>
                      </Flex>
                      <Input placeholder="0" w={16} {...register(item.id)} textAlign="center" />
                    </Center>
                  })
                }
              </Flex>
            </Flex>
          </ShowIf>
          <ShowIf value={step === "secondary_info"}>
            <Text>Selecione outras informações</Text>
            <Flex justifyContent={"space-around"}>
              {
                [
                  {
                    icon: FaSubway,
                    label: 'Metro próximo',
                    id: 'information.nearSubway',
                    defaultValue: formValues.information?.nearSubway
                  },
                  {
                    icon: FaDog,
                    label: 'Aceita pets',
                    id: 'information.acceptPets',
                    defaultValue: formValues.information?.acceptPets
                  },
                  {
                    icon: FaCouch,
                    label: 'Mobiliado',
                    id: 'information.isFurnished',
                    defaultValue: formValues.information?.isFurnished
                  }
                ].map(item => {
                  return <ActivateSecondaryInfoComponent
                    key={item.id}
                    icon={item.icon}
                    label={item.label}
                    defaultValue={item.defaultValue}
                    onChange={value => setValue(item.id, value)}
                  />
                })
              }
            </Flex>
          </ShowIf>
          <ShowIf value={step === "costs"}>
            <Text>Informe os custos principais</Text>
            <Wrap p={4} rowGap={4}>
              {
                allCostsTypes.filter(cost => cost.availableIn.includes(formValues.modo)).map(cost => {
                  return <Center
                    key={cost.name}
                    flexDirection="column"
                    gap={1}
                    boxShadow={"md"}
                    borderRadius="md"
                    p={4}
                  >
                    <Flex alignItems={"center"} gap={2}>
                      <Icon as={FaDollarSign} />
                      <Text>{cost.text}</Text>
                    </Flex>
                    <InputGroup w={36}>
                      <InputLeftAddon>R$</InputLeftAddon>
                      <Input type='number' placeholder='0.00' {...register(cost.name, {
                        setValueAs: Number
                      })} />
                    </InputGroup>
                  </Center>
                })
              }
            </Wrap>
          </ShowIf>
          <ShowIf value={step === "photos"}>
            <Flex width="full" height="full" direction="column" alignItems={"center"} gap={2}>
              <Text>Adicione fotos</Text>
              <Flex {...getRootProps()} flex={1} width={"full"}>
                <input {...getInputProps()} />
                <Center
                  width={"full"}
                  border="1px"
                  borderColor={"gray.300"}
                  borderStyle="dashed"
                  borderRadius={"md"}
                  padding={"2"}
                  textAlign="center"
                  flexDirection={"column"}
                >
                  <AttachmentIcon w={6} h={6} />
                  {
                    isDragActive ?
                      <Text>Coloque os arquivos arqui</Text> :
                      <Text>Arraste e solte aqui arquivos<br />ou clique para selecionar</Text>
                  }
                </Center>
              </Flex>
              <Flex maxW="100%" overflow="auto" gap={2} p={2}>
                {images.map(image => {
                  return <Image
                    key={image.url}
                    alt={image.description || 'Imagem'}
                    src={image.url}
                    h="2xs"
                    w="2xs"
                    boxShadow="md"
                    borderRadius="md"
                  />
                })}
              </Flex>
            </Flex>
          </ShowIf>
        </ModalBody>

        <ModalFooter display="flex" gap={2}>
          <ShowIf value={showBackButton}>
            <Button size="sm" onClick={() => dispatchStep('back')}>Voltar</Button>
          </ShowIf>
          <ShowIf value={step === "import"}>
            <Button size="xs" onClick={() => dispatchStep('next')}>Criar manualmente</Button>
            <Button colorScheme="green" onClick={handleImport} isDisabled={!importUrl}>Importar</Button>
          </ShowIf>
          <ShowIf value={showNextStepButton}>
            <Button onClick={() => dispatchStep('next')} colorScheme="green">Próximo</Button>
          </ShowIf>
          <ShowIf value={step === formSteps[formSteps.length - 1]}>
            <Button colorScheme={"green"} type="submit">Salvar</Button>
          </ShowIf>
        </ModalFooter>
      </form>
    </ModalContent>
  </Modal>
}

const ActivateSecondaryInfoComponent = ({
  onChange,
  defaultValue = false,
  label,
  icon,
}) => {
  const [isActive, setIsActive] = useState(defaultValue);
  const handleChange = useCallback(() => {
    const newState = !isActive;
    setIsActive(newState);
    onChange(newState)
  }, [isActive, onChange])
  return <Center
    flexDirection="column"
    gap={1}
    boxShadow={"md"}
    borderRadius="md"
    p={4}
    border={isActive ? '2px' : '2px'}
    borderColor={isActive ? "green" : 'gray'}
    cursor="pointer"
    onClick={handleChange}
    boxSizing="border-box"
  >
    <Icon as={icon} w={6} h={6} color={isActive ? 'green' : "gray"} />
    <Text userSelect={"none"} color={isActive ? 'green' : "gray"}>{label}</Text>
  </Center>
}

const ShowIf = ({
  value,
  children,
}) => {
  if (value) return <>{children}</>;
  return <></>
}