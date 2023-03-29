import { computed, ref } from "vue"

export default <T = any>(url: string, method = "get", payload?: any) => {
  const res = ref<T>()
  const isLoading = ref<boolean>(false)

  const reFetch = async () => {
    try {
      isLoading.value = true

      const response = await fetch(url, {
        method,
        headers: payload ? { "Content-Type": "application/json" } : undefined,
        credentials: "include",
        body: payload ? JSON.stringify(payload) : undefined
      })

      if (!response.ok) {
        throw new Error(response.status.toString())
      }

      res.value = await response.json()
    } catch (e) {
      throw e
    } finally {
      isLoading.value = false
    }
  }

  const data = computed<T | undefined>(() => res.value)

  return {
    data,
    isLoading,
    fetch: reFetch
  }
}
