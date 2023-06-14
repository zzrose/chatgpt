import stacks from "@/data/stacks.json"
import Header from "@/components/Header"
import Message from "@/components/Message"
import Prompt from "@/components/Prompt"
import { useEffect, useRef, useState } from "react"
import useUser from "@/hooks/useUser"

const SESSION_KEYS = [
  'u1-11111111',
  'u2-22222222',
  'u3-33333333',
  'u4-44444444'
]

export default function Stack({stack, stackKey}) {
  const [messages, setMessages] = useState([])
  const [activeSession, setActiveSession] = useState('')
  const {user} = useUser()
  const chatRef = useRef(null)

  useEffect(() => {
    const cleanChatHistory = async () => {
      await fetch('/api/completion', {method: 'DELETE'})
    }

    cleanChatHistory()
  }, [])

  useEffect(() => {
    if (user) {
      setActiveSession(user.uid)
    }
  }, [user])

  useEffect(() => {
    chatRef.current.scrollTo(0, chatRef.current.scrollHeight)
  }, [messages])

  const onSubmit = async (prompt) => {
    if (prompt.trim().length === 0) {
      return
    }
    setMessages(() => {
      return [
        ...messages,
        {
          id: new Date().toISOString(),
          author: 'human',
          avatar: "https://thrangra.sirv.com/Avatar2.png",
          text: prompt
        }
      ]
    })

    const response = await fetch(`/api/completion?stack=${stackKey}`, {
      method: 'POST',
      body: JSON.stringify({prompt}),
      headers: {
        "Content-type": "application/json"
      }
    })
    const json = await response.json()
    
    if (response.ok) {
      setMessages((messages) => {
        return [
          ...messages,
          {
            id: new Date().toISOString(),
            author: 'ai',
            avatar: "/logo-open-ai.png",
            text: json.result
          }
        ]
      })
    } else {
      console.error(json?.error?.message)
    }
  }

  const handleSessionChange = async (e) => {
    const session = e.target.value

    if (!session) {
      console.log('Not Valid Session')
      return
    }
    await fetch(`/api/completion?uid=${session}`, {method: 'PUT'})
    setActiveSession(session)
  }
  
  return (
    <div className="flex h-full flex-col">
      <Header logo={stack.logo} info={stack.info}/>
      <div className="m-2">Active session: {activeSession}</div>
      <div className="m-2">Uid: {user?.uid}</div>
      <div>
        <select 
          onChange={handleSessionChange}
          value={activeSession}
          className="w-[200px] h-full m-2 text-gray-900 text-sm bg-slate-200 border-slate-200 rounded-md"
        >
          <option value={''} disabled={activeSession !== ''}>choose session</option>
          {SESSION_KEYS.map((sk) => {
            return <option value={sk} key={sk}>{sk}</option>
          })}
        </select>
      </div>
      <hr className="my-4"/>
      <div ref={chatRef} className="chat flex flex-col h-full overflow-scroll">
        { messages.length === 0 &&
          <div className="bg-yellow-200 p-4 rounded-2xl"> 
            No message yet. Ask me something.
          </div>
        }
        { messages.map((message, i) => 
          <Message
            key={message.id}
            idx={i}
            author={message.author}
            avatar={message.avatar}
            text={message.text}
          />
        )}
      </div>
      <div className="flex p-4">
        <Prompt 
          onSubmit={onSubmit}
        />
      </div>
    </div>
  )
}

export async function getStaticPaths() {
  const paths = Object.keys(stacks).map((key) => ({params: {stack: key}}))
  return {
    paths,
    fallback: false
  }
}

export async function getStaticProps({params}) {
  return {
    props: {
      stack: stacks[params.stack],
      stackKey: params.stack
    }  
  }
}