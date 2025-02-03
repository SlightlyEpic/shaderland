import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { defaultFragmentShaderSource, defaultVertexShaderSource } from '../util/defaultShaders'

interface ShaderProgram {
    id: string
    name: string
    vertexShader: string
    fragmentShader: string
    lastModified: number
}

interface ShaderStore {
    currentProgramId: string | null
    currentShader: 'vertex' | 'fragment'
    setCurrentProgramId: (id: string | null) => void
    setCurrentShader: (shader: this["currentShader"]) => void

    programs: Record<string, ShaderProgram>

    setProgram: (program: ShaderProgram) => void
    createProgram: (id: string, name: string) => string
    deleteProgram: (id: string) => void
    updateProgramName: (id: string, name: string) => void

    updateVertexShader: (id: string, content: string) => void
    updateFragmentShader: (id: string, content: string) => void

    getCurrentProgram: () => ShaderProgram | null

    shaderOutput: string;
    setShaderOutput: (error: string) => void
}

export const useShaderStore = create<ShaderStore>()(
    persist(
        (set, get) => ({
            currentProgramId: null,
            currentShader: 'vertex',
            programs: {},
            shaderOutput: '',

            setCurrentProgramId: (id) => set({ currentProgramId: id }),
            setCurrentShader: (shader: 'vertex' | 'fragment') => set({ currentShader: shader }),

            setProgram: (program: ShaderProgram) => {
                set((state) => ({
                    programs: {
                        ...state.programs,
                        [program.id]: program,
                    }
                }))
            },

            createProgram: (id, name) => {
                const newProgram: ShaderProgram = {
                    id,
                    name,
                    vertexShader: defaultVertexShaderSource,
                    fragmentShader: defaultFragmentShaderSource,
                    lastModified: Date.now()
                }

                set((state) => ({
                    programs: { ...state.programs, [id]: newProgram },
                    currentProgramId: id
                }))

                return id
            },

            deleteProgram: (id) => {
                set((state) => {
                    const { [id]: _, ...remainingPrograms } = state.programs
                    return {
                        programs: remainingPrograms,
                        currentProgramId: state.currentProgramId === id ? null : state.currentProgramId
                    }
                })
            },

            updateProgramName: (id, name) => {
                set((state) => ({
                    programs: {
                        ...state.programs,
                        [id]: {
                            ...state.programs[id],
                            name,
                            lastModified: Date.now()
                        }
                    }
                }))
            },

            updateVertexShader: (id, content) => {
                set((state) => ({
                    programs: {
                        ...state.programs,
                        [id]: {
                            ...state.programs[id],
                            vertexShader: content,
                            lastModified: Date.now()
                        }
                    }
                }))
            },

            updateFragmentShader: (id, content) => {
                set((state) => ({
                    programs: {
                        ...state.programs,
                        [id]: {
                            ...state.programs[id],
                            fragmentShader: content,
                            lastModified: Date.now()
                        }
                    }
                }))
            },

            getCurrentProgram: () => {
                const state = get()
                return state.currentProgramId ? state.programs[state.currentProgramId] : null
            },

            setShaderOutput: (output: string) => {
                set((state) => ({
                    shaderOutput: output
                }));
            }
        }),
        {
            name: 'shader-storage',
            version: 1
        }
    )
)
