import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { io } from "socket.io-client"

// Components
import Navigation from './components/Navigation'
import Servers from './components/Servers'
import Channels from './components/Channels'
import Messages from './components/Messages'

// ABIs
import Dappcord from './abis/Dappcord.json'

// Config
import config from './config.json';

// Socket
const socket = io('ws://localhost:3030');

function App() {
  
  const[account, setAccount] = useState(null)
  const[provider, setProvider] = useState(null)
  const[dappcord, setDappcord] = useState(null)
  const[channels, setChannels] = useState([])
  const[currentChannel, setCurrentChannel] = useState(null)
  const[messages, setMessages] = useState([])

  const loadBockchainData = async() =>{
    // talk to block chain
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)

    const network = await provider.getNetwork()
    const dappcord = new ethers.Contract(config[network.chainId].Dappcord.address, Dappcord, provider)
    setDappcord(dappcord)

    console.log('Contract address: ', dappcord.address)
    
    const totalChannels = await dappcord.totalChannels()
    const channels = []

    console.log('Total channels: ', totalChannels)

    for(var i = 1; i <= totalChannels; i++){
      const channel = await dappcord.getChannel(i)
      channels.push(channel)
    }

    setChannels(channels)
    console.log('channels: ', channels)

    // reloads page if account in metmask is changed
    window.ethereum.on('accountsChanged', async() =>{
      window.location.reload()
    })
  }

  useEffect(()=> {
    loadBockchainData()

    socket.on("connect", () =>{
      socket.emit('get messages')
    })

    socket.on("new message", (messages) =>{
      setMessages(messages)
    })

    socket.on("get messages", (messages) =>{
      setMessages(messages)
    })

    return () =>{
      socket.off('connect')
      socket.off('new message')
      socket.off('get messages')
    }

  }, [])

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />

      <main>
        <Servers></Servers>
        <Channels provider ={provider} account={account} dappcord={dappcord} channels={channels} currentChannel={currentChannel} setCurrentChannel={setCurrentChannel}></Channels>
        <Messages account={account} messages={messages} currentChannel={currentChannel}></Messages>

      </main>
    </div>
  );
}

export default App;
