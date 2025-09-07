import { useState } from 'react'
import { RefreshCw, Server, HardDrive, Info, Edit, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useServerInfo } from '@/hooks/useMovies'
import { movieApi } from '@/services/api'

export default function SettingsPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<{ found: number; added: number } | null>(null)
  const [isEditingPath, setIsEditingPath] = useState(false)
  const [newMediaPath, setNewMediaPath] = useState('')
  const [isUpdatingPath, setIsUpdatingPath] = useState(false)
  const [updateResult, setUpdateResult] = useState<{ success: boolean; message: string } | null>(null)
  const { data: serverInfo, refetch: refetchServerInfo } = useServerInfo()

  const handleScan = async () => {
    setIsScanning(true)
    setScanResult(null)
    
    try {
      const result = await movieApi.scanMedia()
      setScanResult({ found: result.found, added: result.added })
    } catch (error) {
      console.error('Scan failed:', error)
    } finally {
      setIsScanning(false)
    }
  }

  const handleEditPath = () => {
    setNewMediaPath(serverInfo?.mediaPath || '')
    setIsEditingPath(true)
    setUpdateResult(null)
  }

  const handleCancelEdit = () => {
    setIsEditingPath(false)
    setNewMediaPath('')
    setUpdateResult(null)
  }

  const handleUpdatePath = async () => {
    if (!newMediaPath.trim()) return
    
    setIsUpdatingPath(true)
    setUpdateResult(null)
    
    try {
      const result = await movieApi.updateMediaPath(newMediaPath)
      setUpdateResult({ success: true, message: result.message })
      setIsEditingPath(false)
      refetchServerInfo()
    } catch (error) {
      setUpdateResult({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to update media path'
      })
    } finally {
      setIsUpdatingPath(false)
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold gradient-text">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Manage your SneakFlix server configuration
        </p>
      </div>

      {/* Server Information */}
      <div className="glass-effect rounded-lg p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Server className="h-5 w-5" />
          <h2 className="text-lg md:text-xl font-semibold">Server Information</h2>
        </div>
        
        {serverInfo && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Server Name</div>
              <div className="font-medium">{serverInfo.name}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Version</div>
              <div className="font-medium">{serverInfo.version}</div>
            </div>
            <div className="sm:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <div className="text-sm text-muted-foreground">Media Directory</div>
                {!isEditingPath && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEditPath}
                    className="h-6 px-2 text-xs self-start sm:self-auto"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
              
              {isEditingPath ? (
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      value={newMediaPath}
                      onChange={(e) => setNewMediaPath(e.target.value)}
                      placeholder="Enter media directory path..."
                      className="font-mono text-sm flex-1"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleUpdatePath}
                        disabled={isUpdatingPath || !newMediaPath.trim()}
                        className="flex-1 sm:flex-none"
                      >
                        <Save className="h-3 w-3 mr-1" />
                        {isUpdatingPath ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                        disabled={isUpdatingPath}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="font-mono text-xs sm:text-sm bg-muted/50 p-2 rounded break-all">
                  {serverInfo.mediaPath}
                </div>
              )}
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Server Time</div>
              <div className="font-medium">
                {new Date(serverInfo.serverTime).toLocaleString()}
              </div>
            </div>
          </div>
        )}
        
        {/* Media Path Update Result */}
        {updateResult && (
          <div className={`mt-4 p-3 rounded-md border ${
            updateResult.success 
              ? 'bg-green-500/10 border-green-500/20' 
              : 'bg-red-500/10 border-red-500/20'
          }`}>
            <div className={`text-sm font-medium ${
              updateResult.success ? 'text-green-400' : 'text-red-400'
            }`}>
              {updateResult.success ? 'Success!' : 'Error!'}
            </div>
            <div className={`text-sm mt-1 ${
              updateResult.success ? 'text-green-300' : 'text-red-300'
            }`}>
              {updateResult.message}
            </div>
          </div>
        )}
      </div>

      {/* Media Management */}
      <div className="glass-effect rounded-lg p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <HardDrive className="h-5 w-5" />
          <h2 className="text-lg md:text-xl font-semibold">Media Management</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Refresh Media Directory</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Refresh your media directory to scan for new movies and update the library.
            </p>
            
            <Button 
              onClick={handleScan} 
              disabled={isScanning}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Refreshing...' : 'Refresh Media Directory'}
            </Button>
            
            {scanResult && (
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-md">
                <div className="text-sm font-medium text-green-400">
                  Refresh completed successfully!
                </div>
                <div className="text-sm text-green-300 mt-1">
                  Found {scanResult.found} files, added {scanResult.added} new movies.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="glass-effect rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Info className="h-5 w-5" />
          <h2 className="text-xl font-semibold">System Information</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Frontend</div>
            <div className="font-medium">React + TypeScript + Radix UI</div>
          </div>
          <div>
            <div className="text-muted-foreground">Backend</div>
            <div className="font-medium">Node.js + Express + SQLite</div>
          </div>
          <div>
            <div className="text-muted-foreground">Supported Formats</div>
            <div className="font-medium">MP4, MKV, AVI, MOV, WMV, WEBM</div>
          </div>
          <div>
            <div className="text-muted-foreground">Subtitles</div>
            <div className="font-medium">SRT, VTT, ASS, SSA, SUB</div>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="glass-effect rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">About SneakFlix</h2>
        <p className="text-muted-foreground leading-relaxed">
          SneakFlix is a personal media streaming server that allows you to stream your movie 
          collection to any device on your local network. Built with modern web technologies 
          and optimized for Raspberry Pi deployment.
        </p>
      </div>

      {/* Developed by */}
      <div className="glass-effect rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Made with ❤️ by</h2>
        <p className="text-muted-foreground leading-relaxed">
          <a 
            href="https://www.linkedin.com/in/prashantrai230/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 transition-colors underline decoration-primary/30 hover:decoration-primary/80"
          >
            Prashant Rai
          </a>
           — combining curiosity, learning, and a love for technology.
        </p>
      </div>
    </div>
  )
}
