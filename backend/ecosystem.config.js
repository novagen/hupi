const watch_delay = 1000;
const autorestart = true;
const node_args = '-r esm';
const max_memory_restart = '1G';

module.exports = {
	apps: [
		{
			name: 'access',
			script: 'access/service.js',
			args: '',
			watch: ["access/"],
			ignore_watch: ["node_modules"],
			node_args: node_args,
			instances: 1,
			autorestart: autorestart,
			watch_delay: watch_delay,
			max_memory_restart: max_memory_restart,
			env: {
				NODE_ENV: 'development'
			},
			env_production: {
				NODE_ENV: 'production'
			}
        },
		{
			name: 'audio',
			script: 'audio/service.js',
			args: '',
			watch: ["audio/"],
			ignore_watch: ["node_modules"],
			node_args: node_args,
			instances: 1,
			autorestart: autorestart,
			watch_delay: watch_delay,
			max_memory_restart: max_memory_restart,
			env: {
				NODE_ENV: 'development'
			},
			env_production: {
				NODE_ENV: 'production'
			}
        },
		{
			name: 'external',
			script: 'external/service.js',
			args: '',
			watch: ["external/"],
			ignore_watch: ["node_modules"],
			node_args: node_args,
			instances: 1,
			autorestart: autorestart,
			watch_delay: watch_delay,
			max_memory_restart: max_memory_restart,
			env: {
				NODE_ENV: 'development'
			},
			env_production: {
				NODE_ENV: 'production'
			}
        },
		{
			name: 'translation',
			script: 'translation/service.js',
			args: '',
			watch: ["translation/"],
			ignore_watch: ["node_modules"],
			node_args: node_args,
			instances: 1,
			autorestart: autorestart,
			watch_delay: watch_delay,
			max_memory_restart: max_memory_restart,
			env: {
				NODE_ENV: 'development'
			},
			env_production: {
				NODE_ENV: 'production'
			}
        },
        {
            name: 'web',
            cwd: "../frontend",
			script: 'npm',
			args: 'start',
			watch: ["../frontend/src/"],
			ignore_watch: ["node_modules"],
			instances: 1,
			autorestart: autorestart,
			watch_delay: watch_delay,
			max_memory_restart: max_memory_restart,
			env: {
				NODE_ENV: 'development'
			},
			env_production: {
				NODE_ENV: 'production'
			}
		}

    ]
};