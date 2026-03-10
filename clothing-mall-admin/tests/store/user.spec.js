import mutations from '@/store/modules/user'

describe('user store mutations', () => {
  let state

  beforeEach(() => {
    state = {
      user: '',
      token: '',
      name: '',
      avatar: '',
      roles: [],
      perms: []
    }
  })

  describe('SET_TOKEN', () => {
    it('should set token', () => {
      mutations.SET_TOKEN(state, 'test-token')
      expect(state.token).toBe('test-token')
    })

    it('should set empty token', () => {
      mutations.SET_TOKEN(state, '')
      expect(state.token).toBe('')
    })
  })

  describe('SET_NAME', () => {
    it('should set name', () => {
      mutations.SET_NAME(state, 'Test User')
      expect(state.name).toBe('Test User')
    })
  })

  describe('SET_AVATAR', () => {
    it('should set avatar', () => {
      mutations.SET_AVATAR(state, 'https://example.com/avatar.png')
      expect(state.avatar).toBe('https://example.com/avatar.png')
    })
  })

  describe('SET_ROLES', () => {
    it('should set roles', () => {
      mutations.SET_ROLES(state, ['admin', 'editor'])
      expect(state.roles).toEqual(['admin', 'editor'])
    })

    it('should set empty roles', () => {
      mutations.SET_ROLES(state, [])
      expect(state.roles).toEqual([])
    })
  })

  describe('SET_PERMS', () => {
    it('should set permissions', () => {
      mutations.SET_PERMS(state, ['user:list', 'user:create'])
      expect(state.perms).toEqual(['user:list', 'user:create'])
    })
  })
})
