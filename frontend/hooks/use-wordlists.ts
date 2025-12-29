"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  getWordlists,
  uploadWordlist,
  deleteWordlist,
  getWordlistContent,
  updateWordlistContent,
} from "@/services/wordlist.service"
import type { GetWordlistsResponse, Wordlist } from "@/types/wordlist.types"

// Get wordlist list
export function useWordlists(params?: { page?: number; pageSize?: number }) {
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10

  return useQuery<GetWordlistsResponse>({
    queryKey: ["wordlists", { page, pageSize }],
    queryFn: () => getWordlists(page, pageSize),
  })
}

// Upload wordlist
export function useUploadWordlist() {
  const queryClient = useQueryClient()

  return useMutation<{}, Error, { name: string; description?: string; file: File }>({
    mutationFn: (payload) => uploadWordlist(payload),
    onMutate: () => {
      toast.loading("Uploading wordlist...", { id: "upload-wordlist" })
    },
    onSuccess: () => {
      toast.dismiss("upload-wordlist")
      toast.success("Wordlist uploaded successfully")
      queryClient.invalidateQueries({ queryKey: ["wordlists"] })
    },
    onError: (error) => {
      toast.dismiss("upload-wordlist")
      toast.error(`Upload failed: ${error.message}`)
    },
  })
}

// Delete wordlist
export function useDeleteWordlist() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, number>({
    mutationFn: (id: number) => deleteWordlist(id),
    onMutate: (id) => {
      toast.loading("Deleting wordlist...", { id: `delete-wordlist-${id}` })
    },
    onSuccess: (_data, id) => {
      toast.dismiss(`delete-wordlist-${id}`)
      toast.success("Wordlist deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["wordlists"] })
    },
    onError: (error, id) => {
      toast.dismiss(`delete-wordlist-${id}`)
      toast.error(`Delete failed: ${error.message}`)
    },
  })
}

// Get wordlist content
export function useWordlistContent(id: number | null) {
  return useQuery<string>({
    queryKey: ["wordlist-content", id],
    queryFn: () => getWordlistContent(id!),
    enabled: id !== null,
  })
}

// Update wordlist content
export function useUpdateWordlistContent() {
  const queryClient = useQueryClient()

  return useMutation<Wordlist, Error, { id: number; content: string }>({
    mutationFn: ({ id, content }) => updateWordlistContent(id, content),
    onMutate: () => {
      toast.loading("Saving...", { id: "update-wordlist-content" })
    },
    onSuccess: (data) => {
      toast.dismiss("update-wordlist-content")
      toast.success("Wordlist saved successfully")
      queryClient.invalidateQueries({ queryKey: ["wordlists"] })
      queryClient.invalidateQueries({ queryKey: ["wordlist-content", data.id] })
    },
    onError: (error) => {
      toast.dismiss("update-wordlist-content")
      toast.error(`Save failed: ${error.message}`)
    },
  })
}
