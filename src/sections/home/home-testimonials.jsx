import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Rating from '@mui/material/Rating';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { fToNow } from 'src/utils/format-time';

import { _testimonials } from 'src/_mock';
import { maxLine, varAlpha, textGradient } from 'src/theme/styles';

import { varFade, MotionViewport, AnimateCountUp } from 'src/components/animate';
import {
  Carousel,
  useCarousel,
  CarouselDotButtons,
  carouselBreakpoints,
  CarouselArrowBasicButtons,
} from 'src/components/carousel';

import { SectionTitle } from './components/section-title';
import { FloatLine, FloatTriangleDownIcon } from './components/svg-elements';

// ----------------------------------------------------------------------

export function HomeTestimonials({ sx, ...other }) {
  const theme = useTheme();

  const renderLines = (
    <>
      <Stack
        spacing={8}
        alignItems="center"
        sx={{ top: 64, left: 80, position: 'absolute', transform: 'translateX(-15px)' }}
      >
        <FloatTriangleDownIcon sx={{ position: 'static', opacity: 0.12 }} />
        <FloatTriangleDownIcon sx={{ width: 30, height: 15, opacity: 0.24, position: 'static' }} />
      </Stack>
      <FloatLine vertical sx={{ top: 0, left: 80 }} />
    </>
  );

  const carousel = useCarousel({
    align: 'start',
    slidesToShow: { xs: 1, sm: 2, md: 3, lg: 4 },
    breakpoints: {
      [carouselBreakpoints.sm]: { slideSpacing: '24px' },
      [carouselBreakpoints.md]: { slideSpacing: '40px' },
      [carouselBreakpoints.lg]: { slideSpacing: '64px' },
    },
  });

  const renderDescription = (
    <SectionTitle
      caption="testimonials"
      title="Rumors are flying"
      txtGradient="that..."
      sx={{ mb: { xs: 5, md: 8 }, textAlign: 'center' }}
    />
  );

  const horizontalDivider = (position) => (
    <Divider
      component="div"
      sx={{
        width: 1,
        opacity: 0.16,
        height: '1px',
        border: 'none',
        position: 'absolute',
        background: `linear-gradient(to right, ${varAlpha(theme.vars.palette.grey['500Channel'], 0)} 0%, ${theme.vars.palette.grey[500]} 50%, ${varAlpha(theme.vars.palette.grey['500Channel'], 0)} 100%)`,
        ...(position === 'top' && { top: 0 }),
        ...(position === 'bottom' && { bottom: 0 }),
      }}
    />
  );

  const verticalDivider = (
    <Divider
      component="div"
      orientation="vertical"
      flexItem
      sx={{
        opacity: 0.16,
        border: 'none',
        width: '1px',
        background: `linear-gradient(to bottom, ${varAlpha(theme.vars.palette.grey['500Channel'], 0)} 0%, ${theme.vars.palette.grey[500]} 50%, ${varAlpha(theme.vars.palette.grey['500Channel'], 0)} 100%)`,
        display: { xs: 'none', md: 'block' },
      }}
    />
  );

  const renderContent = (
    <Stack sx={{ position: 'relative', py: { xs: 5, md: 8 } }}>
      {horizontalDivider('top')}

      <Carousel carousel={carousel}>
        {_testimonials.map((item, index) => (
          <Stack key={item.name} component={m.div} variants={varFade().in}>
            <Stack spacing={1} sx={{ typography: 'subtitle2' }}>
              <Rating
                size="small"
                name="read-only"
                value={item.ratingNumber}
                precision={0.5}
                readOnly
              />
              {/* Fallback category based on index since _testimonials doesn't have it */}
              {
                [
                  'Fleet Management',
                  'Fuel Management',
                  'Driver Management',
                  'Customer Support',
                  'Tyre Management',
                  'Accounting',
                ][index % 6]
              }
            </Stack>

            <Typography
              sx={{ ...maxLine({ line: 4, persistent: theme.typography.body1 }), mt: 2, mb: 3 }}
            >
              {item.content}
            </Typography>

            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar alt={item.name} src={item.avatarUrl} sx={{ width: 48, height: 48 }} />
              <Stack sx={{ typography: 'subtitle1' }}>
                <Box component="span">{item.name}</Box>
                <Box component="span" sx={{ typography: 'body2', color: 'text.disabled' }}>
                  {fToNow(item.postedDate)}
                </Box>
              </Stack>
            </Stack>
          </Stack>
        ))}
      </Carousel>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mt: { xs: 5, md: 8 } }}
      >
        <CarouselDotButtons
          fallback
          variant="rounded"
          scrollSnaps={carousel.dots.scrollSnaps}
          selectedIndex={carousel.dots.selectedIndex}
          onClickDot={carousel.dots.onClickDot}
        />

        <CarouselArrowBasicButtons {...carousel.arrows} options={carousel.options} />
      </Stack>
    </Stack>
  );

  const renderNumber = (
    <Stack sx={{ py: { xs: 5, md: 8 }, position: 'relative' }}>
      {horizontalDivider('top')}

      <Stack spacing={5} direction={{ xs: 'column', md: 'row' }} divider={verticalDivider}>
        {[
          { label: 'Trips created', value: 20 },
          { label: 'Invoices generated', value: 5 },
          { label: 'Vehicles managed', value: 500 },
        ].map((item) => (
          <Stack key={item.label} spacing={2} sx={{ textAlign: 'center', width: 1 }}>
            <m.div variants={varFade({ distance: 24 }).inUp}>
              <AnimateCountUp
                to={item.value}
                unit={item.label === 'Vehicles managed' ? '+' : 'k+'}
                toFixed={0}
                sx={{
                  fontWeight: 'fontWeightBold',
                  fontSize: { xs: 40, md: 64 },
                  lineHeight: { xs: 50 / 40, md: 80 / 64 },
                  fontFamily: theme.typography.fontSecondaryFamily,
                }}
              />
            </m.div>

            <m.div variants={varFade({ distance: 24 }).inUp}>
              <Box
                component="span"
                sx={{
                  ...textGradient(
                    `90deg, ${theme.vars.palette.text.primary}, ${varAlpha(theme.vars.palette.text.primaryChannel, 0.2)}`
                  ),
                  opacity: 0.4,
                  typography: 'h6',
                }}
              >
                {item.label}
              </Box>
            </m.div>
          </Stack>
        ))}
      </Stack>

      {horizontalDivider('bottom')}
    </Stack>
  );

  return (
    <Stack component="section" sx={{ py: 10, position: 'relative', ...sx }} {...other}>
      <MotionViewport>
        {renderLines}

        <Container>
          {renderDescription}

          {renderContent}

          {renderNumber}
        </Container>
      </MotionViewport>
    </Stack>
  );
}

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------
