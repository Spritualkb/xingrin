"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { NucleiGitService } from "@/services/nuclei-git.service"
import type { UpdateNucleiGitSettingsRequest } from "@/types/nuclei-git.types"

export function useNucleiGitSettings() {
  return useQuery({
    queryKey: ["nuclei", "git", "settings"],
    queryFn: () => NucleiGitService.getSettings(),
  })
}

export function useUpdateNucleiGitSettings() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateNucleiGitSettingsRequest) => NucleiGitService.updateSettings(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["nuclei", "git", "settings"] })
      toast.success(res?.message || "Git repository configuration saved")
    },
    onError: () => {
      toast.error("Failed to save Git repository configuration, please try again")
    },
  })
}
