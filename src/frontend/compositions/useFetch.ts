import { computed, ref } from "vue"

export default <T = any>(url: string, method: "get" | "post" | "put" | "patch" | "delete" = "get", payload?: any) => {
  const res = ref<T>()
  const isLoading = ref<boolean>(false)

  const reFetch = async (newPayload = payload) => {
    try {
      isLoading.value = true

      const response = await fetch(url, {
        method,
        headers: newPayload ? { "Content-Type": "application/json" } : undefined,
        credentials: "include",
        body: newPayload ? JSON.stringify(newPayload) : undefined
      })

      if (!response.ok) {
        throw new Error(response.status.toString())
      }

      if (response.headers.get("Content-Type") === "application/json") {
        res.value = await response.json()
      } else {
        res.value = (await response.text()) as T
      }
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
