                                                                                
// boot do app se o conteudo mudar).
//
                                                                                
// via o endpoint local passado em ALETHE_BRIDGE_ENDPOINT (injetado como env var
                                                                          
// quebrar a sessao do OpenCode se o Alethe nao estiver rodando ou a porta tiver
// mudado.
export const AletheBridgePlugin = async ({ directory }) => {
  const endpoint = process.env.ALETHE_BRIDGE_ENDPOINT
  if (!endpoint) return {}

  const report = async (state) => {
    try {
      await fetch(`${endpoint}/opencode-status`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ directory, state }),
      })
    } catch {
                                                                              
    }
  }

  return {
    event: async ({ event }) => {
      if (event.type === "session.idle") await report("idle")
    },
    "tool.execute.before": async () => {
      await report("working")
    },
  }
}
