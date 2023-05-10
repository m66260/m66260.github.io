import { memo } from 'react';

import { Box, Link, Typography } from '@mui/material';

import { ReactComponent as Logo } from 'assets/logo.svg';
import { ReactComponent as GithubLogo } from 'assets/social/github.svg';
import { ReactComponent as MediumLogo } from 'assets/social/medium.svg';
import { ReactComponent as TwitterLogo } from 'assets/social/twitter.svg';
import { ReactComponent as DiscordLogo } from 'assets/social/discord.svg';

import { Container } from '../container/Container';

import styles from './Footer.module.scss';

export const Footer = memo(() => {
  return (
    <footer>
      <Container>
        <Box className={styles.rootBox}>
          <Box component="nav">
            <Typography color="textSecondary" variant="caption" gutterBottom={false}>
              © Copyright 2023 D8X
            </Typography>
          </Box>
          <Box className={styles.iconsHolder}>
            <Link
              href="https://github.com/D8-X"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerSocialLogo}
            >
              <GithubLogo />
            </Link>
            <Link
              href="https://medium.com/@d8x.exchange"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerSocialLogo}
            >
              <MediumLogo />
            </Link>
            <Link
              href="https://discord.gg/JdJ8EXqCVE"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerSocialLogo}
            >
              <DiscordLogo />
            </Link>
            <Link
              href="https://twitter.com/d8x_exchange"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerSocialLogo}
            >
              <TwitterLogo />
            </Link>
          </Box>
          <Link
            href="https://d8x.exchange"
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
            underline="none"
            className={styles.footerLogoWrapper}
          >
            <Logo className={styles.footerLogo} />
          </Link>
        </Box>
      </Container>
    </footer>
  );
});
