import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Image,
  Input,
  SimpleGrid,
  Text,
  Stack,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { Alchemy, Network, Utils } from 'alchemy-sdk';
import { useState, useEffect } from 'react';

import { ConnectButton } from '@rainbow-me/rainbowkit';

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'

function App() {
  const [userAddress, setUserAddress] = useState('');
  const [results, setResults] = useState([]);
  const [hasQueried, setHasQueried] = useState(false);
  const [tokenDataObjects, setTokenDataObjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { address, isConnected } = useAccount()
  const account = useAccount({
    onConnect({ address, connector, isReconnected }) {
      console.log('Connected', { address, connector, isReconnected });
      setUserAddress(address);
      setResults([]);
      setHasQueried(false);
      // getTokenBalance(null, address, "onConnect");
    },
    onDisconnect() {
      console.log('Disconnected')
      setUserAddress("");
      setResults([]);
      setHasQueried(false);
    },
  })
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  })
  const { disconnect } = useDisconnect()

  async function getTokenBalance(event, _address, from) {
    setIsLoading(true);
    setResults([]);
    setTokenDataObjects([]);
    setHasQueried(false);
    console.log("Get Token Balance userAddress: ", userAddress);
    console.log("Get Token Balance: _address: ", _address);
    console.log("Get Token Balance: from: ", from);
    console.log("Get Token Balance: event: ", event);
    const callAddress = _address ? _address : userAddress;

    const apiKey = "zzWHdoHRNQ_s3yaJVr-RMMAUlcgpbyyc";

    const config = {
      apiKey,
      network: Network.ETH_MAINNET,
    };

    const alchemy = new Alchemy(config);

    const resolvedAddress = await alchemy.core.resolveName(callAddress);
    console.log("Resolved Address: ", resolvedAddress);
    const data = await alchemy.core.getTokenBalances(callAddress);

    setResults(data);

    const tokenDataPromises = [];

    for (let i = 0; i < data.tokenBalances.length; i++) {
      const tokenData = alchemy.core.getTokenMetadata(
        data.tokenBalances[i].contractAddress
      );
      tokenDataPromises.push(tokenData);
    }

    const tokenDataObjects = await Promise.all(tokenDataPromises);
    console.log("Token Data Objects: ", tokenDataObjects);

    setTokenDataObjects(tokenDataObjects);
    setHasQueried(true);
    setIsLoading(false);
  }
  return (
    <Box>
      <Box className='connect-button-container'>
        <ConnectButton
          label="Connect Wallet"
          accountStatus="address"
          chainStatus="icon"
          showBalance={true}
        />
      </Box>
      <Box w="100vw" marginTop="100px">
        <Center>
          <Flex
            alignItems={'center'}
            justifyContent="center"
            flexDirection={'column'}
          >
            <Heading mb={0} fontSize={36}>
              ERC-20 Token Indexer
            </Heading>
            <Text>
              Plug in an address and this website will return all of its ERC-20
              token balances!
            </Text>
          </Flex>
        </Center>
        <Flex
          w="100%"
          flexDirection="column"
          alignItems="center"
          justifyContent={'center'}
        >
          <Heading mt={42}>
            Get all the ERC-20 token balances of this address:
          </Heading>
          <Input
            value={userAddress}
            onChange={(e) => setUserAddress(e.target.value)}
            color="black"
            w="600px"
            textAlign="center"
            p={4}
            bgColor="white"
            fontSize={16}
            mt={12}
          />
          <Button
            fontSize={20}
            onClick={getTokenBalance}
            colorScheme='teal'
            isLoading={isLoading}
            loadingText='Checking'
            mt={12}
          >
            Check ERC-20 Token Balances
          </Button>

          <Heading my={10}>ERC-20 token balances:</Heading>

          {hasQueried ? (
            <SimpleGrid w={'90vw'} columns={4} spacing={10}>
              {results.tokenBalances.map((e, i) => {
                return (
                  // <Flex
                  //   flexDir={'column'}
                  //   color="white"
                  //   bg="blue"
                  //   w={'20vw'}
                  //   key={i}
                  // >
                  //   <Box>
                  //     <b>Symbol:</b> ${tokenDataObjects[i].symbol}&nbsp;
                  //   </Box>
                  //   <Box>
                  //     <b>Balance:</b>&nbsp;
                  //     {Utils.formatUnits(
                  //       e.tokenBalance,
                  //       tokenDataObjects[i].decimals
                  //     )}
                  //   </Box>
                  //   <Image src={tokenDataObjects[i].logo} />
                  // </Flex>
                  <Card maxW='sm'>
                    <CardBody>
                      <Image
                        src={tokenDataObjects[i].logo}
                        alt='Green double couch with wooden legs'
                        borderRadius='lg'
                      />
                      <Stack mt='6' spacing='3'>
                        <Heading size='md'>
                          {tokenDataObjects[i].symbol}
                        </Heading>
                        <Text color='blue.600'>
                          {Utils.formatUnits(e.tokenBalance, tokenDataObjects[i].decimals)}
                        </Text>
                      </Stack>
                    </CardBody>
                  </Card>
                );
              })}
            </SimpleGrid>
          ) : (
            'Please make a query! This may take a few seconds...'
          )}
        </Flex>
      </Box>
    </Box>
  );
}

export default App;
