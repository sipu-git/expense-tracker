export const formatDate = (iso: string): string => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { year: "numeric", month: 'short', day: 'numeric' })
}
