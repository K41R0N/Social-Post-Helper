import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import {
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  FolderOpen,
  Grid3x3,
  List,
  Search,
  Monitor,
  Settings as SettingsIcon,
  ArrowRight,
} from 'lucide-react';
import {
  getAllProjects,
  createNewProject,
  deleteProject,
  duplicateProject,
  renameProject,
  getProjectMetadata,
} from '../lib/projectStorage';
import type { ProjectMetadata } from '../types/project';

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [projects, setProjects] = useState<ProjectMetadata[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renamingProject, setRenamingProject] = useState<ProjectMetadata | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    loadProjects();
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const loadProjects = () => {
    const metadata = getProjectMetadata();
    setProjects(metadata.sort((a, b) => 
      new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()
    ));
  };

  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    try {
      const project = createNewProject(newProjectName.trim());
      setNewProjectDialogOpen(false);
      setNewProjectName('');
      toast.success('Project created!');
      setLocation(`/editor/${project.id}`);
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  const handleDeleteProject = (id: string, name: string) => {
    if (!confirm(`Delete project "${name}"? This cannot be undone.`)) return;

    try {
      deleteProject(id);
      loadProjects();
      toast.success('Project deleted');
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const handleDuplicateProject = (id: string) => {
    try {
      duplicateProject(id);
      loadProjects();
      toast.success('Project duplicated!');
    } catch (error) {
      toast.error('Failed to duplicate project');
    }
  };

  const handleRenameProject = () => {
    if (!renamingProject || !renameValue.trim()) return;

    try {
      renameProject(renamingProject.id, renameValue.trim());
      loadProjects();
      setRenameDialogOpen(false);
      setRenamingProject(null);
      setRenameValue('');
      toast.success('Project renamed!');
    } catch (error) {
      toast.error('Failed to rename project');
    }
  };

  const openRenameDialog = (project: ProjectMetadata) => {
    setRenamingProject(project);
    setRenameValue(project.name);
    setRenameDialogOpen(true);
  };

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const projectColors = ['#FF6B5A', '#6B9FFF', '#7FD957', '#FFB5C5', '#FFD966'];

  // Mobile warning
  if (isMobile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-8">
        <div className="max-w-md w-full bg-white rounded-3xl border-4 border-black shadow-2xl p-8 text-center">
          <Monitor className="h-16 w-16 mx-auto mb-6 text-black" />
          <h1 className="dof-title mb-4">Desktop Only</h1>
          <p className="dof-body mb-4">
            Go-Round requires a desktop screen for the best experience.
          </p>
          <p className="dof-body-sm">
            Please visit this site on a device with a screen width of at least 1024px.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b-4 border-black">
        <div className="max-w-[1600px] mx-auto px-8 py-10">
          <div className="flex items-start justify-between mb-10">
            <div className="flex-1">
              <h1 className="dof-huge-title mb-3">
                GO-ROUND
              </h1>
              <p className="dof-body text-gray-600">
                Create stunning social media carousels
              </p>
            </div>

            <div className="flex gap-4 items-start">
              <button
                onClick={() => setLocation('/settings')}
                className="dof-btn dof-btn-outline"
              >
                <SettingsIcon size={20} />
                Settings
              </button>
              <button
                onClick={() => setNewProjectDialogOpen(true)}
                className="dof-btn dof-btn-coral dof-btn-lg"
              >
                <Plus size={24} />
                NEW PROJECT
                <ArrowRight size={20} />
              </button>
            </div>
          </div>

          {/* Search and View Controls */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative max-w-2xl">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 border-3 border-black rounded-2xl text-base font-medium focus:outline-none focus:border-coral transition-colors"
              />
            </div>
            <div className="flex gap-2 border-3 border-black rounded-full p-1.5 bg-white">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-full transition-all ${
                  viewMode === 'grid' ? 'bg-black text-white' : 'hover:bg-gray-100'
                }`}
              >
                <Grid3x3 size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-full transition-all ${
                  viewMode === 'list' ? 'bg-black text-white' : 'hover:bg-gray-100'
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-8 py-12">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-32">
            <FolderOpen className="h-32 w-32 mx-auto mb-10 text-gray-200 stroke-[1.5]" />
            <h2 className="dof-title mb-4">
              {searchQuery ? 'NO PROJECTS FOUND' : 'NO PROJECTS YET'}
            </h2>
            <p className="dof-body text-gray-600 mb-10 max-w-md mx-auto">
              {searchQuery
                ? 'Try a different search term'
                : 'Create your first carousel project to get started'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setNewProjectDialogOpen(true)}
                className="dof-btn dof-btn-black dof-btn-lg"
              >
                <Plus size={24} />
                CREATE PROJECT
                <ArrowRight size={20} />
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => {
              const bgColor = projectColors[index % projectColors.length];
              
              return (
                <div
                  key={project.id}
                  className="dof-card group cursor-pointer"
                  style={{ borderColor: '#000', borderWidth: '3px' }}
                  onClick={() => setLocation(`/editor/${project.id}`)}
                >
                  {/* Colored Header */}
                  <div
                    className="h-40 -mx-6 -mt-6 mb-8 flex items-center justify-center rounded-t-3xl"
                    style={{ backgroundColor: bgColor }}
                  >
                    <div className="text-center">
                      <div className="text-7xl font-black text-black/20 mb-2">
                        {project.slideCount}
                      </div>
                      <p className="text-sm font-bold text-black/60 uppercase tracking-wider">
                        SLIDES
                      </p>
                    </div>
                  </div>

                  {/* Project Info */}
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="dof-subtitle break-words flex-1 pr-4 leading-tight">
                        {project.name}
                      </h3>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <button className="p-2.5 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
                            <MoreVertical size={20} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="border-2 border-black rounded-xl w-48">
                          <DropdownMenuItem onClick={() => setLocation(`/editor/${project.id}`)}>
                            <FolderOpen className="mr-3 h-4 w-4" />
                            Open
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            openRenameDialog(project);
                          }}>
                            <Edit className="mr-3 h-4 w-4" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateProject(project.id);
                          }}>
                            <Copy className="mr-3 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project.id, project.name);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-3 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-600 mb-6 font-medium">
                      <span>{project.carouselCount} carousel{project.carouselCount !== 1 ? 's' : ''}</span>
                      <span>•</span>
                      <span>{formatDate(project.modifiedAt)}</span>
                    </div>

                    <button
                      onClick={() => setLocation(`/editor/${project.id}`)}
                      className="dof-btn dof-btn-black w-full"
                    >
                      Open Project
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((project, index) => {
              const bgColor = projectColors[index % projectColors.length];
              
              return (
                <div
                  key={project.id}
                  className="dof-card flex items-center gap-8 cursor-pointer"
                  style={{ borderColor: '#000', borderWidth: '3px' }}
                  onClick={() => setLocation(`/editor/${project.id}`)}
                >
                  {/* Color Block */}
                  <div
                    className="w-28 h-28 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: bgColor }}
                  >
                    <span className="text-5xl font-black text-black/30">
                      {project.slideCount}
                    </span>
                  </div>

                  {/* Project Info */}
                  <div className="flex-1 min-w-0 py-2">
                    <h3 className="dof-subtitle mb-2 truncate">
                      {project.name}
                    </h3>
                    <p className="dof-body-sm text-gray-600">
                      {project.carouselCount} carousel{project.carouselCount !== 1 ? 's' : ''} • {project.slideCount} slide{project.slideCount !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Date */}
                  <div className="text-sm text-gray-600 font-medium flex-shrink-0">
                    {formatDate(project.modifiedAt)}
                  </div>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <button className="p-3 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
                        <MoreVertical size={20} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="border-2 border-black rounded-xl">
                      <DropdownMenuItem onClick={() => setLocation(`/editor/${project.id}`)}>
                        <FolderOpen className="mr-2 h-4 w-4" />
                        Open
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        openRenameDialog(project);
                      }}>
                        <Edit className="mr-2 h-4 w-4" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateProject(project.id);
                      }}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project.id, project.name);
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Project Dialog */}
      <Dialog open={newProjectDialogOpen} onOpenChange={setNewProjectDialogOpen}>
        <DialogContent className="border-4 border-black rounded-3xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="dof-title">CREATE NEW PROJECT</DialogTitle>
            <DialogDescription className="dof-body-sm">
              Give your carousel project a name
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <input
              type="text"
              placeholder="My Awesome Carousel"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateProject();
              }}
              className="dof-input"
              autoFocus
            />
          </div>

          <DialogFooter className="gap-3">
            <button
              onClick={() => setNewProjectDialogOpen(false)}
              className="dof-btn dof-btn-outline"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateProject}
              className="dof-btn dof-btn-green"
            >
              Create Project
              <ArrowRight size={18} />
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Project Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="border-4 border-black rounded-3xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="dof-title">RENAME PROJECT</DialogTitle>
            <DialogDescription className="dof-body-sm">
              Enter a new name for your project
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <input
              type="text"
              placeholder="Project name"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameProject();
              }}
              className="dof-input"
              autoFocus
            />
          </div>

          <DialogFooter className="gap-3">
            <button
              onClick={() => setRenameDialogOpen(false)}
              className="dof-btn dof-btn-outline"
            >
              Cancel
            </button>
            <button
              onClick={handleRenameProject}
              className="dof-btn dof-btn-blue"
            >
              Rename Project
              <ArrowRight size={18} />
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
